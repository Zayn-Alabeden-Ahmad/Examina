from rest_framework import serializers
from django.contrib.auth import authenticate

from core.models import Person, Student, Level , Profile

from rest_framework.validators import UniqueValidator



class StudentRegisterSerializer(serializers.ModelSerializer):
   
    password = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(
    validators=[UniqueValidator(queryset=Person.objects.all())]  )


    class Meta:
        model = Person
       
        fields = ['email', 'first_name', 'last_name', 'password']
        
    def validate(self, data):
     first = data.get('first_name', '')
     last = data.get('last_name', '')

    
     first_normalized = " ".join(first.strip().split())
     last_normalized = " ".join(last.strip().split())

    
     first_formatted = first_normalized.title()
     last_formatted = last_normalized.title()

    
     if Person.objects.filter(
        first_name__iexact=first_formatted,
        last_name__iexact=last_formatted
     ).exists():
        raise serializers.ValidationError("User with same first and last name already exists")

    
     data['first_name'] = first_formatted
     data['last_name'] = last_formatted

     return data


    def create(self, validated_data):
     password = validated_data.pop('password')
     email = validated_data['email']
     person = Person(
        username=email, 
        email=email,
        first_name=validated_data['first_name'],
        last_name=validated_data['last_name'])
     person.set_password(password)
     person.save()

     profile = Profile.objects.create(
        Person=person,
             )
     default_level = Level.objects.first()

     student = Student.objects.create(
        Person=person,
        Level=default_level,
        StudentPoints=0
     )
     return person





class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        user = authenticate(username=email, password=password) 

        if not user:
            raise serializers.ValidationError("wrong email or wrong password")
        if not user.is_active:
            raise serializers.ValidationError("User is deactivated")

        data['user'] = user
        return data
    

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # إضافة الـ token_version
        token["token_version"] = user.token_version

        return token
      




class LevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Level
        fields = '__all__'




from rest_framework import serializers
from .models import Person, Profile, Student, Teacher

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['ProfilePicture', 'Bio']

class StudentExtraSerializer(serializers.ModelSerializer):
    level_name = serializers.CharField(source='Level.LevelName', read_only=True)
    class Meta:
        model = Student
        fields = ['StudentPoints', 'level_name']

class TeacherExtraSerializer(serializers.ModelSerializer):
    star_level_name = serializers.CharField(source='StarLevel.LevelName', read_only=True)
    class Meta:
        model = Teacher
        fields = ['Age', 'StarTotalPoints', 'star_level_name', 'QuestionsAdded']


class UserProfileSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()
    extra_info = serializers.SerializerMethodField()
    # أضفنا هذا الحقل لاستقبال العمر في طلبات التعديل فقط
    age = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Person
        fields = ['first_name', 'last_name', 'email', 'profile', 'extra_info', 'age']

    def get_extra_info(self, obj):
        if hasattr(obj, 'student'):
            return StudentExtraSerializer(obj.student).data
        elif hasattr(obj, 'teacher'):
            return TeacherExtraSerializer(obj.teacher).data
        return None

    def update(self, instance, validated_data):
        # 1. استخراج البيانات المنفصلة
        profile_data = validated_data.pop('profile', None)
        age_data = validated_data.pop('age', None)

        # 2. تحديث بيانات جدول Person (الأساسي)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.email = validated_data.get('email', instance.email)
        instance.save()

        # 3. تحديث بيانات جدول Profile
        if profile_data:
            profile = instance.profile
            profile.Bio = profile_data.get('Bio', profile.Bio)
            # تحديث الصورة فقط إذا تم إرسال ملف جديد
            if 'ProfilePicture' in profile_data:
                profile.ProfilePicture = profile_data.get('ProfilePicture', profile.ProfilePicture)
            profile.save()

        # 4. تحديث الـ Age إذا كان المستخدم Teacher
        if age_data is not None and hasattr(instance, 'teacher'):
            teacher = instance.teacher
            teacher.Age = age_data
            teacher.save()

        return instance
    

from rest_framework import serializers
from .models import Person, Profile, Student, Teacher
from rest_framework import serializers
from achievements.models import UserAchievement, Achievement

class AchievementSerializer(serializers.ModelSerializer):
    # نصل لبيانات الإنجاز الأساسي من خلال علاقة الـ ForeignKey في UserAchievement
    name = serializers.CharField(source='Achievement.Name', read_only=True)
    description = serializers.CharField(source='Achievement.Description', read_only=True)
    image = serializers.ImageField(source='Achievement.Image', read_only=True)
    date_earned = serializers.DateField(source='DateEarned', read_only=True)

    class Meta:
        model = UserAchievement
        # هذه الحقول هي التي ستظهر في الـ JSON النهائي
        fields = ['name', 'description', 'image', 'date_earned']
# --- ليدربورد الطلاب ---
class StudentLeaderboardSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='Person.first_name', read_only=True)
    last_name = serializers.CharField(source='Person.last_name', read_only=True)
    # تعديل هذا السطر ليصبح آمناً
    level_name = serializers.SerializerMethodField()
    profile_pic = serializers.ImageField(source='Person.profile.ProfilePicture', read_only=True)

    class Meta:
        model = Student
        fields = ['StudentID', 'first_name', 'last_name', 'level_name', 'StudentPoints', 'profile_pic']

    def get_level_name(self, obj):
        # التحقق إذا كان الطالب لديه مستوى مرتبط به أم لا
        if obj.Level:
            return obj.Level.LevelName
        return "No Level" # أو أي نص افتراضي تفضله
# --- ليدربورد الأساتذة ---
class TeacherLeaderboardSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='Person.first_name', read_only=True)
    last_name = serializers.CharField(source='Person.last_name', read_only=True)
    # تعريف الحقل بشكل آمن للتعامل مع الـ NULL أيضاً (مثل مشكلة الطلاب)
    num_stars = serializers.SerializerMethodField()
    profile_pic = serializers.ImageField(source='Person.profile.ProfilePicture', read_only=True)

    class Meta:
        model = Teacher
        # تأكد من وجود 'num_stars' هنا داخل المصفوفة
        fields = ['TeacherID', 'first_name', 'last_name', 'num_stars', 'StarTotalPoints', 'profile_pic']

    def get_num_stars(self, obj):
        # التحقق من وجود StarLevel لتجنب الـ AttributeError
        if obj.StarLevel:
            return obj.StarLevel.NumStars
        return 0 # أو أي قيمة افتراضية للأساتذة بدون نجوم