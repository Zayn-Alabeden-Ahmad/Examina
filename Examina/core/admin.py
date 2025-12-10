from django.contrib import admin

from .models import Person , Student , Teacher , Profile , Level 


from django.contrib.auth.admin import UserAdmin
from .models import Person
from .models import StarLevel

admin.site.register(Student)

admin.site.register(StarLevel)


admin.site.register(Teacher)


admin.site.register(Profile)


admin.site.register(Level)


from django.db import connection
from django.contrib import admin
from .models import Person
from django.contrib.auth.admin import UserAdmin


@admin.register(Person)
class PersonAdmin(UserAdmin):
    model = Person
    list_display = ('email', 'first_name', 'last_name', 'Status', 'is_staff')
    ordering = ('email',)
    fieldsets = (
        ('email', {'fields': ('username','email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'Status')}),
        ('Permissions', {'fields': ('is_active','is_staff','is_superuser','groups','user_permissions')}),
        ('Important dates', {'fields': ('last_login','date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email','username','first_name','last_name','password1','password2','Status','is_staff','is_superuser')}
        ),
    )
