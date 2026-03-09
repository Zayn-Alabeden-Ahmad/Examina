from rest_framework import serializers
from .models import UserAchievement, Achievement

class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ['AchievementID', 'Name', 'Description', 'Image',] # أضف الحقول الموجودة في مودل Achievement عندك

class UserAchievementSerializer(serializers.ModelSerializer):
    # جلب تفاصيل الإنجاز بدلاً من الـ ID فقط
    achievement_details = AchievementSerializer(source='Achievement', read_only=True)

    class Meta:
        model = UserAchievement
        fields = ['UserAchievementID', 'DateEarned', 'achievement_details']