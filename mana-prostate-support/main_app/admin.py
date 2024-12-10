# admin.py
from django.contrib import admin
from .models import Article, Category, SupportGroup, Topic

@admin.register(SupportGroup)
class SupportGroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'city', 'region', 'meeting_time', 'meeting_date', 'is_approved')
    list_filter = ('city', 'region', 'is_approved')
    search_fields = ('name', 'location', 'contacts', 'notes', 'meeting_date')
    prepopulated_fields = {'slug': ('name',)}

    fieldsets = (
        (None, {
            'fields': ('name', 'location', 'city', 'region', 'slug')
        }),
        ('Meeting Details', {
            'fields': ('meeting_time', 'meeting_date'),
        }),
        ('Contact Information', {
            'fields': ('contacts', 'email'),
        }),
        ('Additional Information', {
            'fields': ('notes', 'is_approved'),
        }),
    )

    actions = ['approve_groups']

    def approve_groups(self, request, queryset):
        queryset.update(is_approved=True)
    approve_groups.short_description = "Approve selected support groups"


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {"slug": ("name",)}

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'author', 'pub_date')
    list_filter = ('category', 'author', 'pub_date')
    search_fields = ('title', 'content')
    prepopulated_fields = {"slug": ("title",)}
    date_hierarchy = 'pub_date'
    ordering = ('-pub_date',)

@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug')
    prepopulated_fields = {"slug": ("title",)}