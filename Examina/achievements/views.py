from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import UserAchievement
from .serializers import UserAchievementSerializer

class GetMyAchievements(APIView):
    # لا يمكن الدخول إلا لمستخدم مسجل (Authenticated)
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            # نجلب الإنجازات الخاصة بالمستخدم الحالي (الموجود في الـ Token)
            # نستخدم الشخص الحالي من خلال request.user
            achievements = UserAchievement.objects.filter(Person=request.user).select_related('Achievement')
            
            if not achievements.exists():
                return Response({"message": "You haven't earned any achievements yet."}, status=status.HTTP_404_NOT_FOUND)
            
            serializer = UserAchievementSerializer(achievements, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)