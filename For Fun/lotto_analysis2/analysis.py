import pandas as pd
import glob
from collections import Counter
import random

def process_lotto_files(file_pattern, num_predictions=5):
    # List to store data from all files
    all_data = []
    
    # Read all files matching the pattern
    for file in glob.glob(file_pattern):
        # Read each file into a DataFrame
        df = pd.read_csv(file)
        # Select relevant columns
        columns_of_interest = ["Winning Number 1", "2", "3", "4", "5", "6", "Bonus Number"]
        winning_numbers = df[columns_of_interest]
        all_data.append(winning_numbers)
    
    # Combine all data into a single DataFrame
    combined_data = pd.concat(all_data, ignore_index=True)
    
    # Flatten the numbers into a single list for frequency analysis
    all_winning_numbers = combined_data.values.flatten()
    
    # Count the frequency of each number
    winning_number_frequency = Counter(all_winning_numbers)
    
    # Identify the most common numbers
    most_common_winning_numbers = winning_number_frequency.most_common()
    
    # Generate multiple predictions
    predictions = []
    for _ in range(num_predictions):
        predicted_main_numbers = random.sample(
            [num for num, count in most_common_winning_numbers], 6
        )
        bonus_numbers = combined_data["Bonus Number"].dropna().astype(int)
        bonus_number_frequency = Counter(bonus_numbers)
        predicted_bonus_number = (
            random.choice(list(bonus_number_frequency)) if bonus_number_frequency else None
        )
        predictions.append({
            "Predicted Main Lotto Numbers": [int(num) for num in predicted_main_numbers],
            "Predicted Bonus Number": int(predicted_bonus_number) if predicted_bonus_number else None
        })
    
    return predictions

# Use the function to process files
file_pattern = '*.csv'  # Update this to the folder containing your files
predictions = process_lotto_files(file_pattern, num_predictions=5)

# Print predictions
for i, prediction in enumerate(predictions, start=1):
    print(f"Prediction Set {i}: {prediction}")