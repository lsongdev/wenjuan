import * as yaml from 'https://lsong.org/scripts/yaml.js';
import { serialize, createFormFields } from 'https://lsong.org/scripts/form.js?v1';

// 纯函数：解析YAML
const parseYAML = (yamlString) => {
  try {
    return yaml.load(yamlString);
  } catch (error) {
    console.error('解析YAML失败:', error);
    return null;
  }
};

// 纯函数：生成表单
const generateForm = (fields) => {
  const formElement = document.createElement('form');
  createFormFields(fields).forEach(field => formElement.appendChild(field));
  const submitButton = document.createElement('button');
  submitButton.className = 'button button-block';
  submitButton.textContent = '提交';
  submitButton.type = 'submit';
  formElement.appendChild(submitButton);
  return formElement;
};

const calculateScore = (questions, answers) => {
  return questions.reduce((totalScore, question) => {
    if (!question.scoring) return totalScore;

    const userAnswer = answers[question.name];
    let questionScore = 0;

    switch (question.scoring.strategy) {
      case 'exact':
        if (JSON.stringify(userAnswer) === JSON.stringify(question.scoring.answer)) {
          questionScore = question.scoring.score;
        }
        break;
      case 'comprehensive':
        if (userAnswer) {
          const answerLower = userAnswer.toLowerCase();

          // 计算长度得分
          const length = userAnswer.length;
          const lengthScore = Math.min(
            question.scoring.score * 0.2, // 长度占总分的 20%
            ((length - question.scoring.min_length) / (question.scoring.max_length - question.scoring.min_length)) * (question.scoring.score * 0.2)
          );

          // 计算评分标准和关键词得分
          const criteriaScore = question.scoring.criteria.reduce((score, criterion) => {
            const keywordMatches = criterion.keywords.filter(keyword =>
              answerLower.includes(keyword.toLowerCase())
            );
            const keywordScore = (keywordMatches.length / criterion.keywords.length) * criterion.score;
            return score + keywordScore;
          }, 0);

          // 综合得分
          questionScore = Math.min(
            question.scoring.score,
            lengthScore + criteriaScore
          );
        }
        break;

      default:
        console.warn(`Unknown scoring strategy for question: ${question.name}`);
    }

    console.log(`Question: ${question.name}, User Answer: ${userAnswer}, Score: ${questionScore}, Strategy: ${question.scoring.strategy}`);
    return totalScore + questionScore;
  }, 0);
};

// 新增：计算总分的函数
const calculateTotalScore = (questions) => {
  return questions.reduce((total, question) => {
    if (question.scoring && question.scoring.score) {
      return total + question.scoring.score;
    }
    return total;
  }, 0);
};

const addNumbering = (questions) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  return questions.map((question, index) => {
    question.label = `${index + 1}. ${question.label}`;
    if (question.options && Array.isArray(question.options)) {
      question.options = question.options.map((option, optionIndex) => {
        if (typeof option === 'string') {
          return `${alphabet[optionIndex]}. ${option}`;
        } else if (typeof option === 'object') {
          return {
            ...option,
            label: `${alphabet[optionIndex]}. ${option.label}`
          };
        }
        return option;
      });
    }
    return question;
  });
};

const initializeForm = (yamlString) => {
  const title = document.getElementById('title');
  const container = document.getElementById('form');
  const formData = parseYAML(yamlString);
  if (!formData) return;

  title.textContent = formData.title;

  // 在生成表单之前添加序号
  const numberedQuestions = addNumbering(formData.questions);

  const form = generateForm(numberedQuestions);
  const totalPossibleScore = calculateTotalScore(numberedQuestions);
  form.addEventListener('submit', (e) => handleSubmit(e, numberedQuestions, totalPossibleScore));
  container.appendChild(form);
};

// 修改后的处理提交函数
const handleSubmit = (e, questions, totalPossibleScore) => {
  e.preventDefault();
  const answers = serialize(e.target);
  console.log(answers);
  const score = calculateScore(questions, answers);
  displayResult(score, totalPossibleScore);
};

// 副作用函数：显示结果
const displayResult = (score, totalPossibleScore) => {
  const resultElement = document.getElementById('result');
  if (resultElement) {
    resultElement.textContent = `您的得分是: ${score} / ${totalPossibleScore}`;
  }
};

// 初始化表单
window.onload = async () => {
  const exampleYaml = await fetch('data.yaml').then(res => res.text());
  initializeForm(exampleYaml, 'form')
};

export { initializeForm, parseYAML, generateForm, calculateScore };