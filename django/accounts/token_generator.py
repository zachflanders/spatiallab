from django.contrib.auth.tokens import PasswordResetTokenGenerator


class CustomTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        email = user.email
        password = user.password
        return f"{user.pk}{timestamp}{email}{password}"


custom_token_generator = CustomTokenGenerator()
