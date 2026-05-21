from django.http import JsonResponse
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import status

class TokenVersionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # 1. محاولة التحقق من التوكن باستخدام SimpleJWT
        auth = JWTAuthentication()
        header = auth.get_header(request)
        
        if header:
            raw_token = auth.get_raw_token(header)
            try:
                # فك تشفير التوكن
                validated_token = auth.get_validated_token(raw_token)
                user = auth.get_user(validated_token)
                
                # 2. مقارنة النسخة الموجودة في التوكن مع النسخة في قاعدة البيانات
                token_version_in_jwt = validated_token.get('token_version')
                current_db_version = user.token_version
                
                if token_version_in_jwt != current_db_version:
                    return JsonResponse(
                        {"detail": "الجلسة انتهت، يرجى تسجيل الدخول مجدداً."},
                        status=status.HTTP_401_UNAUTHORIZED
                    )
            except Exception:
                # نترك التعامل مع التوكنات المنتهية أو الخاطئة لـ DRF نفسه
                pass

        return self.get_response(request)