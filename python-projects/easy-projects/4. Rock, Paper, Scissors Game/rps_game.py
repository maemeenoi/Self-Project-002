#Rock, Paper, Scissors Game
# Import the random module.
import random

# Define a list containing the three options: "rock", "paper", and "scissors".
def display_choice():
    ROCK = '🪨'
    PAPER = '🧻'
    SCISSORS = '✂'
    print(f'Here your options! 1.{ROCK}, 2.{PAPER}, 3.{SCISSORS}. If you want to EXIT choose 4')
# Create a loop to allow multiple rounds of the game.
def gameplay():
    score = 0
    display_choice()
    choices_map = {
        '1' : '🪨',
        '2' : '🧻',
        '3' : '✂'
    }
    while True:
# Prompt the user to input their choice (rock, paper, or scissors).
        choice = input("Enter your choice (1/2/3/4): ")
# Randomly select the computer’s choice from the list.
        computer = str(random.randint(1, 3))
# Compare the user’s choice and the computer’s choice:
        user_choice = choices_map[choice]
        computer_choice = choices_map[computer]      
        if choice in ('1','2','3','4'):            
# If the user’s choice beats the computer’s choice, the user wins the round.
            if (choice == '3' and computer == '2') or (choice == '2' and computer == '1') or (choice == '1' and computer == '3'):
                print(f"You: {user_choice} , Computer: {computer_choice}")
                score = score + 1
                print('Yay! you WIN!')
                print (f"Current Score: {score}")
# If the computer’s choice beats the user’s choice, the computer wins the round.
            elif (computer == '3' and choice == '2') or (computer == '2' and choice == '1') or (computer == '1' and choice == '3'):
                print(f"You: {user_choice} , Computer: {computer_choice}")
                print('Aww! You lost! Try again!')
                print (f"Current Score: {score}")
# If both choices are the same, it’s a tie.
            elif choice == computer:
                print(f"You: {user_choice} , Computer: {computer_choice}")
                print("Tie!! Try Again!")
                print (f"Current Score: {score}")
# Display the result of the round and update the score accordingly.
            elif choice == '4':
                print('Bye!! Thanks for playing!')
                break
# Ask the user if they want to play another round. If yes, repeat the loop; otherwise, exit.
        else: 
            print('Invalid input!')
        
        play_again = input("Do you want to play it again!? (Y/N): ")
        if play_again.lower() != 'y':
            break

gameplay()