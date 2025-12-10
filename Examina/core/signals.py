from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.dispatch import receiver

@receiver(user_logged_in)
def set_status_active(sender, user, request, **kwargs):
    user.Status = 'active'
    user.save()


@receiver(user_logged_out)
def set_status_inactive(sender, user, request, **kwargs):
    user.Status = 'inactive'
    user.save()


    