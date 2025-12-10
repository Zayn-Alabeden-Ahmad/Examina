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
      
