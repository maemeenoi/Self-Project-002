#Number Guessing Game

#Import a random number generator module.
import random


def guessing_game():
    #Generate a random number within a predefined range (e.g., 1 to 100).
    random_num = random.randrange(100)
    print(random_num)
    while True:
        #Prompt the user to guess the number.
        guess_num = int(input("Please put the gussing number! (0-100): "))
        print(guess_num)

        if guess_num != '1':
            #Compare the user’s guess with the generated number:
            #If the guess is too high, display "Too high! Try again."
            if guess_num > random_num:
                print ("Too high! Try again.")
            #If the guess is too low, display "Too low! Try again."
            elif guess_num < random_num:
                print("Too low! Try again.")
            #If the guess is correct, display "Congratulations! You've guessed the number."
            elif guess_num == random_num:
                print("Congratulations! You've guessed the number.")
                play_again = input("Do you want to play again?: y/n")
                if play_again.lower() != 'y':
                    break
                else:
                    random_num = random.randrange(100)
                    print(random_num)

        else:
            print("Invalid Number!")

guessing_game()

