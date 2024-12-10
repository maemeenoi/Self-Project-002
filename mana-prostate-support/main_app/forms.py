from django import forms
from localflavor.nz.forms import NZRegionSelect, REGION_CHOICES
from .models import SupportGroup, NZ_COUNCIL_CHOICES

class SupportGroupForm(forms.ModelForm):
    city = forms.ChoiceField(choices=NZ_COUNCIL_CHOICES)
    
    class Meta:
        model = SupportGroup
        fields = ['name', 'location', 'city', 'region', 'meeting_time', 'notes', 'is_approved']
        widgets = {
            'region': NZRegionSelect(),
        }

class ContactForm(forms.Form):
    name = forms.CharField(max_length=100, required=True)
    email = forms.EmailField(required=True)
    subject = forms.CharField(max_length=200, required=True)
    message = forms.CharField(widget=forms.Textarea, required=True)

class SupportGroupSearchForm(forms.Form):
    location = forms.CharField(max_length=100, required=False)

class RegionForm(forms.Form):
    region = forms.ChoiceField(
        choices=REGION_CHOICES,
        label="Choose Your Region",
        widget=forms.Select(attrs={'class': 'form-select'})  # Adding Bootstrap class here
    )
