import os
from google import genai
from dotenv import load_dotenv

# Load configuration variables from .env file
load_dotenv()

class AIService:
    """
    AIService connects to the Google Gemini API using the newer google-genai package.
    It builds a personalized system prompt from the member's real-time database stats
    and sends their message to the model for a context-aware response.
    """

    def __init__(self):
        # Retrieve the API key from environment variables
        self.__api_key = os.getenv("GEMINI_API_KEY")
        self.__client = None

        if self.__api_key:
            # Create a Gemini client instance
            self.__client = genai.Client(api_key=self.__api_key)
        else:
            print("WARNING: GEMINI_API_KEY not found in environment. PULSE AI will run in offline mode.")

    def generate_gym_response(self, user_name, user_age, user_gender, membership_status, expiry_date, booked_classes, weight_logs, user_message):
        """
        Sends the member's message to Gemini with injected context from the database.

        Parameters:
            user_name (str): Member's full name
            user_age (int): Member's age
            user_gender (str): Member's gender
            membership_status (str): e.g. 'active', 'pending', 'No Plan'
            expiry_date (str): Membership end date
            booked_classes (list): List of class name strings
            weight_logs (list): List of WeightLog model objects
            user_message (str): The member's chat message

        Returns:
            str: The AI-generated reply text
        """

        # If the API key is not configured, return a friendly offline message
        if not self.__client:
            return (
                "Hello! I am PULSE AI, your personal gym assistant. "
                "I am currently offline because the administrator has not configured "
                "the GEMINI_API_KEY in the `.env` file yet. "
                "Please add a valid key to start chatting!"
            )

        # 1. Format booked classes into a readable string
        classes_str = ", ".join(booked_classes) if booked_classes else "No classes booked yet."

        # 2. Format weight logs into a readable string
        if weight_logs:
            weight_str = ", ".join([f"{w.getWeightKg()}kg on {w.getDate()}" for w in weight_logs])
        else:
            weight_str = "No weight logged yet."

        # 3. Build the system instruction with the member's real-time data
        system_instruction = (
            f"You are 'PULSE AI', a friendly, professional personal trainer and gym assistant at KINETIC Gym.\n"
            f"You are conversing with a gym member. Here is their current dashboard information:\n"
            f"- Member Name: {user_name}\n"
            f"- Age: {user_age}\n"
            f"- Gender: {user_gender}\n"
            f"- Active Membership Status: {membership_status} (expires: {expiry_date})\n"
            f"- Class Bookings: {classes_str}\n"
            f"- Weight History logs: {weight_str}\n\n"
            f"RULES:\n"
            f"1. Be encouraging, motivational, and concise. Keep answers to under 3-4 sentences where possible.\n"
            f"2. Use the provided profile stats (name, weight history, booked classes) to give customized advice when relevant.\n"
            f"3. Do not make up facts about KINETIC Gym; stick to answering fitness, workout, nutrition, and dashboard questions.\n"
            f"4. If asked about classes, encourage them to book classes in the 'Gym Features' tab.\n"
            f"5. Address the member by their first name to keep the tone personal."
        )

        try:
            # 4. Call the Gemini API using the new google-genai client
            response = self.__client.models.generate_content(
                model="gemini-3.1-flash-lite",
                config={
                    "system_instruction": system_instruction,
                },
                contents=user_message
            )
            return response.text.strip()

        except Exception as e:
            # Catch API key validation errors or network issues gracefully
            return f"Sorry, I encountered an error while processing your request: {str(e)}"
