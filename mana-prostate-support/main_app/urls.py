from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('about/', views.about, name='about'),
    path('resources/', views.resources, name='resources'),
    path('article/<slug:slug>/', views.article_detail, name='article_detail'),
    path('category/<slug:slug>/', views.category_detail, name='category_detail'),
    path('support-groups/', views.choose_region, name='choose_region'),
    path('support-groups/<str:region>/', views.support_groups_by_region, name='support_groups_by_region'),
    path('contact/', views.contact, name='contact'),
    path('contact/success/', views.contact_success, name='contact_success'),
    path('support-info/', views.support_info, name='support_info'),
    path('person-living-with-cancer/', views.person_living_with_cancer, name='person_living_with_cancer'),
    path('topic/<slug:slug>/', views.topic_page, name='topic_page'),


    ## Support & Information landing page
    path('support-info/', views.support_info, name='support_info'),
    path('topic/risks/', views.topic_page, name='risks_page'),
    path('topic/symptoms/', views.topic_page, name='symptoms_page'),
    path('topic/testing/', views.topic_page, name='testing_page'),
    path('topic/treatment/', views.topic_page, name='treatment_page'),

    # Emotional Support, Practical Help, Nutrition Support
    path('topic/emotional-support/', views.topic_page, name='emotional_support_page'),
    path('topic/practical-care-and-support/', views.topic_page, name='practical_help_page'),
    path('support-group-finder/', views.choose_region, name='support_group_finder_page'),
    
    # Caregiver's Guide, Support Group Finder, Recommended Reading
    path('topic/nutrition-support/', views.topic_page, name='nutrition_support_page'),
    path('topic/caregiver-guide/', views.topic_page, name='caregiver_guide_page'),
    path('resources/', views.resources, name='recommended_reading_page'),

    # Person Living with Cancer landing page
    path('person-living-with-cancer/', views.person_living_with_cancer, name='person_living_with_cancer'),

    # Understanding Prostate Cancer section
    path('topic/what-is-prostate-cancer/', views.topic_page, name='what_is_prostate_cancer'),
    path('topic/symptoms/', views.topic_page, name='symptoms_page'),
    path('topic/diagnosis/', views.topic_page, name='diagnosis_page'),
    path('topic/treatment-options/', views.topic_page, name='treatment_options_page'),

    # Information by Cancer Stage section
    path('topic/stage-1/', views.topic_page, name='stage_1_info'),
    path('topic/stage-2/', views.topic_page, name='stage_2_info'),
    path('topic/stage-3/', views.topic_page, name='stage_3_info'),
    path('topic/stage-4/', views.topic_page, name='stage_4_info'),

    # Find Support section
    path('support-group-finder/', views.choose_region, name='support_group_finder_page'),

    # Emergency Helpline (optional, if you want a dedicated page for this)
    path('emergency-helpline/', views.topic_page, name='emergency_helpline'),

    # Latest Research and News (optional, if you want a dedicated page for this)
    path('latest-research-news/', views.article_detail, name='latest_research_news'),

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)