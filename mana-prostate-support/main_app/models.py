from django.db import models
from django.contrib.auth.models import User
from django.contrib.admin import SimpleListFilter
from django.utils.text import slugify
from localflavor.nz.nz_regions import REGION_CHOICES
from localflavor.nz.nz_councils import NORTH_ISLAND_COUNCIL_CHOICES, SOUTH_ISLAND_COUNCIL_CHOICES

# Combine North and South Island council choices
NZ_COUNCIL_CHOICES = NORTH_ISLAND_COUNCIL_CHOICES + SOUTH_ISLAND_COUNCIL_CHOICES

class Category(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name

class Article(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    content = models.TextField()
    pub_date = models.DateTimeField('date published')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)

    def __str__(self):
        return self.title

class Region(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name

class SupportGroup(models.Model):
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    city = models.CharField(max_length=100, choices=NZ_COUNCIL_CHOICES)
    region = models.CharField(max_length=6, choices=REGION_CHOICES)
    meeting_time = models.CharField(max_length=100)
    meeting_date = models.CharField(max_length=255, help_text="Enter meeting date, frequency, or instructions (e.g., 'Every second Tuesday', 'Monthly', 'Contact for next meeting date')", default="Contact for next meeting date")
    contacts = models.TextField(help_text="Enter contact names and phone numbers, one per line.")
    email = models.EmailField(blank=True)
    notes = models.TextField(blank=True)
    is_approved = models.BooleanField(default=False)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

class Topic(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    content = models.TextField()  # This can include HTML content.
    image = models.ImageField(upload_to='topic_images/', blank=True, null=True)  # Adjusted path
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.title
