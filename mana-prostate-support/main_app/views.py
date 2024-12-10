from django.shortcuts import render, get_object_or_404, redirect
from django.core.paginator import Paginator
from django.contrib import messages
from django.http import JsonResponse
from django.core.mail import send_mail
from django.conf import settings
from .models import Article, Category, SupportGroup, Topic
from .forms import  SupportGroupSearchForm, ContactForm, RegionForm
from django.utils.html import format_html
from localflavor.nz.nz_regions import REGION_CHOICES
import logging

def home(request):
    # latest_articles = Article.objects.order_by('-pub_date')[:5]
    return render(request, 'main_app/home.html')

def about(request):
    return render(request, 'main_app/about.html')

def resources(request):
    latest_articles = Article.objects.order_by('-pub_date')[:5]
    return render(request, 'main_app/resources.html', {'latest_articles': latest_articles})

def article_detail(request, slug):
    article = get_object_or_404(Article, slug=slug)
    return render(request, 'main_app/article_detail.html', {'article': article})

def category_detail(request, slug):
    category = get_object_or_404(Category, slug=slug)
    articles = Article.objects.filter(category=category).order_by('-pub_date')
    paginator = Paginator(articles, 10)  # Show 10 articles per page
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    return render(request, 'main_app/category_detail.html', {'category': category, 'page_obj': page_obj})


def choose_region(request):
    """View to select the region from REGION_CHOICES"""
    if request.method == 'POST':
        form = RegionForm(request.POST)
        if form.is_valid():
            selected_region = form.cleaned_data['region']
            return redirect('support_groups_by_region', region=selected_region)
        else:
            messages.error(request, 'Please select a valid region.')
    else:
        form = RegionForm()

    return render(request, 'main_app/choose_region.html', {'form': form})

def support_groups(request):
    form = SupportGroupSearchForm(request.GET)
    groups = SupportGroup.objects.filter(is_approved=True)
    if form.is_valid():
        if form.cleaned_data['location']:
            groups = groups.filter(location__icontains=form.cleaned_data['location'])
    return render(request, 'main_app/support_groups.html', {'form': form, 'groups': groups})

def support_groups_by_region(request, region):
    """View to display support groups for the selected region"""
    # Map the region code to the full name
    region_full_name = dict(REGION_CHOICES).get(region, region)  # Default to code if not found
    support_groups = SupportGroup.objects.filter(region=region)
    
    for group in support_groups:
        contacts = group.contacts.split('\n')  # Assuming contacts are stored in a newline-separated format
        formatted_contacts = []
        for contact in contacts:
            if contact.strip():
                name, _, phone = contact.partition(':')
                formatted_contact = format_html('<strong>{}</strong>: {}', name.strip(), phone.strip())
                formatted_contacts.append(formatted_contact)
        group.formatted_contacts = formatted_contacts
    
    context = {
        'support_groups': support_groups,
        'region': region_full_name  # Pass the full name of the region
    }
    return render(request, 'main_app/support_groups_by_region.html', context)

def group_detail(request, slug):
    group = get_object_or_404(SupportGroup, slug=slug)
    return render(request, 'main_app/group_detail.html', {'group': group})

# Main Pages Section Knowledge about the Prostate Cancer
def topic_page(request, slug):
    topic = get_object_or_404(Topic, slug=slug)

    # Get related articles for this topic (optional, using Article model)
    # related_articles = Article.objects.filter(category__name=topic.title)[:5]
    related_articles = Article.objects.filter(category__slug=slug)[:5]

    context = {
        "topic_title": topic.title,
        "topic_description": topic.description,
        "topic_content": topic.content,
        "topic_image": topic.image,  # Add image to the context
        "related_articles": related_articles,
    }

    return render(request, 'main_app/topic_page.html', context)

logger = logging.getLogger(__name__)

def contact(request):
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            name = form.cleaned_data['name']
            email = form.cleaned_data['email']
            subject = form.cleaned_data['subject']
            message = form.cleaned_data['message']
            email_sent = False  # Default to False

            try:
                # Attempt to send the email
                send_mail(
                    f'Contact Form: {subject}',
                    f'From: {name} <{email}>\n\n{message}',
                    settings.DEFAULT_FROM_EMAIL,
                    [settings.CONTACT_EMAIL],
                    fail_silently=False,
                )
                email_sent = True
            except Exception as e:
                # Log any errors
                logger.error(f"Failed to send email: {str(e)}")

            # Handle AJAX request with appropriate JSON response
            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                if email_sent:
                    # Success response with status 200
                    return JsonResponse({'message': 'Thank you! Your message has been successfully sent.'}, status=200)
                else:
                    # Error response with status 400
                    return JsonResponse({'message': 'There was an error sending your message. Please try again later.'}, status=400)
            else:
                # Redirect to success or show error on non-AJAX requests
                if email_sent:
                    return redirect('contact_success')
                else:
                    form.add_error(None, 'There was an error sending your message. Please try again later.')
        else:
            # Return form errors for invalid form submissions
            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                return JsonResponse({'errors': form.errors}, status=400)
    else:
        form = ContactForm()

    return render(request, 'main_app/contact.html', {'form': form})


def contact_success(request):
    return render(request, 'main_app/contact_success.html')

def support_info(request):
    learn_items = [
        {'title': 'Risks', 'url': 'risks_page'},
        {'title': 'Symptoms', 'url': 'symptoms_page'},
        {'title': 'Testing and Diagnosis', 'url': 'testing_page'},
        {'title': 'Treatment', 'url': 'treatment_page'},
    ]
    
    support_items = [
        {'title': 'As Families, Friends and Whānau', 'url': 'emotional_support_page'},
        {'title': 'Practical Care and Support', 'url': 'practical_help_page'},
        {'title': 'Looking for Support Groups', 'url': 'support_group_finder_page'},
    ]
    
    resource_items = [
        {'title': 'Nutrition Support', 'url': 'nutrition_support_page'},
        {'title': 'Articles Reading', 'url': 'recommended_reading_page'},
        {'title': "Caregiver's Guide", 'url': 'caregiver_guide_page'},
    ]
    
    context = {
        'learn_items': learn_items,
        'support_items': support_items,
        'resource_items': resource_items,
    }
    
    # print("Context being sent to template:", context)  # Add this line for debugging
    
    return render(request, 'main_app/support_info.html', context)

def person_living_with_cancer(request):
    understanding_items = [
        {'title': 'What is Prostate Cancer?', 'url': 'what_is_prostate_cancer'},
        {'title': 'Symptoms', 'url': 'symptoms_page'},
        {'title': 'Testing and Diagnosis', 'url': 'testing_page'},
        {'title': 'Treatment', 'url': 'treatment_page'},
    ]
    
    stage_items = [
        {'title': 'Stage 1', 'url': 'stage_1_info'},
        {'title': 'Stage 2', 'url': 'stage_2_info'},
        {'title': 'Stage 3', 'url': 'stage_3_info'},
        {'title': 'Stage 4', 'url': 'stage_4_info'},
    ]
    
    support_items = [
        {'title': 'Support Groups', 'url': 'support_group_finder_page'},
    ]
    
    # Fetch the latest 3 articles in the 'latest_research_news' category
    try:
        latest_research_category = Category.objects.get(name='Latest Research and News')
        latest_articles = Article.objects.filter(category=latest_research_category).order_by('-pub_date')[:3]
    except Category.DoesNotExist:
        latest_articles = []
    
    context = {
        'understanding_items': understanding_items,
        'stage_items': stage_items,
        'support_items': support_items,
        'latest_articles': latest_articles,
    }
    
    return render(request, 'main_app/person_living_with_cancer.html', context)