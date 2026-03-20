# AWS Cloud Practitioner & IHK Quiz

A modern, responsive web application designed for AWS Certified Cloud Practitioner exam preparation and IHK basics. This quiz helps users master cloud concepts through interactive questions with bilingual support.

## Features

- **Two Selection Paths**:
  - **Global Random Mode (Exam Simulation)**: Mixes all available questions from the entire database for a comprehensive review.
  - **Topic-specific Learning**: Allows users to focus on specific categories (e.g., 'Security', 'Economics', 'NIST Merkmale').
- **Dynamic Category Extraction**: The app automatically identifies all unique categories from the `questions.json` file and generates selection buttons, ensuring future-proof scalability.
- **Bilingual Interface**: Seamlessly switch between German (DE) and English (EN) at any time.
- **Customizable Question Count**: Choose how many questions you want to answer via a slider or manual input.
- **Two Quiz Modes**:
  - **Study Mode**: Receive immediate feedback and detailed explanations for each question.
  - **Exam Mode**: Test your knowledge under exam-like conditions with results revealed at the end.
- **Robust Shuffle Logic**: Questions are shuffled once at the start of each session to ensure variety.
- **Timed Challenges**: Each question is allocated 1.5 minutes to help you manage your time effectively.
- **Real-time Progress Tracking**: Visualize your progress with a dynamic progress bar and question counter.
- **Comprehensive Results**: View your final score percentage and pass/fail status (70% passing threshold).

## Tech Stack

- **Frontend**: HTML5, Vanilla JavaScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (CDN), Vanilla CSS for custom animations and UI components.
- **Typography**: [Google Fonts (Outfit)](https://fonts.google.com/specimen/Outfit)
- **Data**: JSON-based question storage.

## Project Structure

- `index.html`: The main entry point and UI structure.
- `app.js`: Application logic including state management, i18n, and quiz flow.
- `questions.json`: A structured database of quiz questions in both German and English.
- `style.css`: Custom CSS for animations, specific UI styling, and component overrides.

## Getting Started

To run the application locally, simply open the `index.html` file in any modern web browser. No complex installation or build steps are required.

```bash
# Clone the repository
git clone https://github.com/JLJ-HH/aws_quiz.git

# Navigate to the project directory
cd aws_quiz

# Open index.html in your browser
open index.html
```

## Adding New Questions

You can easily expand the quiz by adding new entries to the `questions.json` file. Each question follows this format:

```json
{
  "id": 21,
  "type": "single",
  "category": {
    "de": "Kategorie Name",
    "en": "Category Name"
  },
  "question": {
    "de": "Deine Frage hier?",
    "en": "Your question here?"
  },
  "options": {
    "de": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "en": ["Option 1", "Option 2", "Option 3", "Option 4"]
  },
  "correct": [0],
  "explanation": {
    "de": "Erklärung für die richtige Antwort.",
    "en": "Explanation for the correct answer."
  }
}
```

## License

This project is open-source and available under the MIT License.
