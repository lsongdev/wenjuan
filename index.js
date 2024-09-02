// quiz.js

const quizQuestions = [
  {
    label: "你的名字是什么?",
    type: "text",
    required: true
  },
  {
    label: "你几岁了?",
    type: "number",
    required: true
  },
  {
    label: "1 + 1 = ?",
    type: "number",
    answer: 2,
    score: 5
  },
  {
    label: "选择你喜欢的颜色",
    type: "select",
    options: ["红色", "蓝色", "绿色"],
    answer: "蓝色",
    score: 3
  },
  {
    label: "2 * 3 = ?",
    type: "number",
    answer: 6,
    score: 5
  }
];

function generateForm(questions, formElement) {
  questions.forEach((question, index) => {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question';

    const label = document.createElement('label');
    label.textContent = question.label;
    questionDiv.appendChild(label);

    let input;
    switch (question.type) {
      case 'text':
        input = document.createElement('input');
        input.type = 'text';
        break;
      case 'number':
        input = document.createElement('input');
        input.type = 'number';
        break;
      case 'select':
        input = document.createElement('select');
        question.options.forEach(option => {
          const optionElement = document.createElement('option');
          optionElement.value = option;
          optionElement.textContent = option;
          input.appendChild(optionElement);
        });
        break;
      default:
        input = document.createElement('input');
        input.type = 'text';
    }
    input.name = `question_${index}`;
    input.required = question.required;
    questionDiv.appendChild(input);

    formElement.appendChild(questionDiv);
  });
}

export function initializeQuiz() {
  const formElement = document.getElementById('quizForm');
  generateForm(quizQuestions, formElement);

  const submitButton = document.createElement('button');
  submitButton.textContent = '提交';
  submitButton.type = 'button';
  submitButton.onclick = handleSubmit;
  formElement.appendChild(submitButton);
}

export function handleSubmit() {
  const form = document.getElementById('quizForm');
  const formData = new FormData(form);
  const answers = Object.fromEntries(formData);
  console.log(answers);

  let score = 0;
  let totalScore = 0;

  quizQuestions.forEach((question, index) => {
    const userAnswer = answers[`question_${index}`];
    if (question.answer !== undefined) {
      totalScore += question.score;
      if (userAnswer == question.answer) {
        score += question.score;
      }
    }
  });

  const resultElement = document.getElementById('result');
  resultElement.textContent = `您的得分是: ${score} / ${totalScore}`;
}

// 这个函数将来可以用于从远程加载问题
export async function loadQuestionsFromRemote(url) {
  try {
    const response = await fetch(url);
    const questions = await response.json();
    return questions;
  } catch (error) {
    console.error('加载问题失败:', error);
    return [];
  }
}

window.onload = initializeQuiz;
window.handleSubmit = handleSubmit;