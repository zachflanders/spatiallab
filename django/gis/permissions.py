from rest_framework import permissions
from gis.models import ProjectLayer


class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to view or edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Object-level permission to only allow owners of the object to view/edit it.
        return obj.owner == request.user


class IsProjectOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Check if the user is the owner of the project related to the project layer
        return obj.project.owner == request.user
