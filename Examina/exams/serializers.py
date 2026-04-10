from rest_framework import serializers

class CategorySerializer(serializers.Serializer):
    CategoryName = serializers.CharField()



from .models import Question, Answer


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ["AnswerID", "AnswerText", "IsCorrect"]

class QuestionSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(source='answer_set', many=True)

    class Meta:
        model = Question
        fields = [
            "QuestionID",
            "QuestionName",
            "QuestionText",
            "Category",
            "Rate",
            "Points",
            "QuestionType",
            "answers",
        ]

    def create(self, validated_data):
        answers_data = validated_data.pop('answer_set', [])
        question = Question.objects.create(**validated_data)
        for ans_data in answers_data:
            Answer.objects.create(Question=question, **ans_data)
        return question

    def update(self, instance, validated_data):
        # استخراج بيانات الإجابات من البيانات المرسلة
        answers_data = validated_data.pop('answer_set', [])
        
        # تحديث حقول السؤال الأساسية
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # الحصول على الإجابات الحالية للسؤال
        existing_answers = {ans.AnswerID: ans for ans in instance.answer_set.all()}
        
        # قائمة لتخزين IDs الإجابات المستلمة
        received_answer_ids = []
        
        # معالجة كل إجابة مرسلة من الواجهة
        for ans_data in answers_data:
            ans_id = ans_data.get('AnswerID')
            
            if ans_id:  # إذا كانت الإجابة موجودة مسبقاً (لها ID)
                received_answer_ids.append(ans_id)
                
                if ans_id in existing_answers:
                    # تحديث إجابة موجودة
                    answer = existing_answers[ans_id]
                    for attr, value in ans_data.items():
                        if attr != 'AnswerID':
                            setattr(answer, attr, value)
                    answer.save()
                    
                    # إزالة من القائمة بعد التحديث
                    del existing_answers[ans_id]
            else:
                # إضافة إجابة جديدة (ما لها ID)
                Answer.objects.create(Question=instance, **ans_data)
        
        # حذف الإجابات الموجودة في قاعدة البيانات ولكن غير المرسلة من الواجهة
        # (يعني اللي حذفها المستخدم من الشاشة)
        for answer in existing_answers.values():
            # التحقق من عدم ارتباط الإجابة بإجابات طلاب
            if answer.studentanswer_set.exists():
                # إذا في طلاب اختاروها، لا تحذفها لكن علم أنها غير نشطة
                answer.IsActive = False  # محتاج تضيف هذا الحقل أولاً
                answer.save()
            else:
                # إذا ما حد اختارها، احذفها
                answer.delete()
        
        return instance
                                
            
        




class StudentAnswerInputSerializer(serializers.Serializer):
    questionId = serializers.IntegerField()
    answerId = serializers.IntegerField()
    pointsEarned = serializers.IntegerField()
    isCorrect = serializers.BooleanField()
    qRatedByStudent = serializers.IntegerField()



from rest_framework import serializers
from .models import ChallengeExam, StudentChallenge, Question, Answer

class ChallengeExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChallengeExam
        fields = '__all__'
        extra_kwargs = {'PreviousChallengeID': {'read_only': True}}

    def create(self, validated_data):
        min_points = validated_data.get('MinPointsRequired')
        
        # البحث عن التحدي السابق: صاحب أعلى نقاط متطلبة لكنها أقل من الحالي
        previous_challenge = ChallengeExam.objects.filter(
            MinPointsRequired__lt=min_points
        ).order_by('-MinPointsRequired').first()
        
        validated_data['PreviousChallengeID'] = previous_challenge
        return super().create(validated_data)

class StudentChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentChallenge
        fields = '__all__'  