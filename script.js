class Calculator {
  constructor(previousOperandTextElement, currentOperandTextElement) {
    this.previousOperandTextElement = previousOperandTextElement;
    this.currentOperandTextElement = currentOperandTextElement;
    this.clear();
  }

  clear() {
    this.currentOperand = '0';
    this.previousOperand = '';
    this.operation = undefined;
    this.shouldResetScreen = false;
  }

  delete() {
    if (this.currentOperand === '0') return;
    if (this.currentOperand.length === 1 || (this.currentOperand.length === 2 && this.currentOperand.startsWith('-'))) {
      this.currentOperand = '0';
      return;
    }
    this.currentOperand = this.currentOperand.toString().slice(0, -1);
  }

  appendNumber(number) {
    if (this.currentOperand === '0' && number !== '.') {
      this.currentOperand = number.toString();
      return;
    }
    if (this.shouldResetScreen) {
      this.currentOperand = number.toString();
      this.shouldResetScreen = false;
      return;
    }
    if (number === '.' && this.currentOperand.includes('.')) return;
    this.currentOperand = this.currentOperand.toString() + number.toString();
  }

  chooseOperation(operation) {
    if (this.currentOperand === '0' && this.previousOperand === '') return;
    
    if (this.previousOperand !== '') {
      this.compute();
    }
    this.operation = operation;
    this.previousOperand = this.currentOperand;
    this.currentOperand = '';
  }

  compute() {
    let computation;
    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.currentOperand);
    if (isNaN(prev) || isNaN(current)) return;
    switch (this.operation) {
      case '+':
        computation = prev + current;
        break;
      case '-':
        computation = prev - current;
        break;
      case '*':
        computation = prev * current;
        break;
      case '/':
        if (current === 0) {
          computation = 'Error';
        } else {
          computation = prev / current;
        }
        break;
      case '%':
        computation = prev % current;
        break;
      default:
        return;
    }
    this.currentOperand = computation;
    this.operation = undefined;
    this.previousOperand = '';
    this.shouldResetScreen = true;
  }

  getDisplayNumber(number) {
    if (number === 'Error') return number;
    const stringNumber = number.toString();
    const integerDigits = parseFloat(stringNumber.split('.')[0]);
    const decimalDigits = stringNumber.split('.')[1];
    let integerDisplay;
    if (isNaN(integerDigits)) {
      integerDisplay = '';
    } else {
      integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
    }
    if (decimalDigits != null) {
      return `${integerDisplay}.${decimalDigits}`;
    } else {
      return integerDisplay;
    }
  }

  updateDisplay() {
    this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);
    if (this.operation != null) {
      let opSymbol = this.operation;
      if (this.operation === '*') opSymbol = '×';
      if (this.operation === '/') opSymbol = '÷';
      if (this.operation === '-') opSymbol = '−';
      
      this.previousOperandTextElement.innerText = `${this.getDisplayNumber(this.previousOperand)} ${opSymbol}`;
    } else {
      this.previousOperandTextElement.innerText = '';
    }
  }
}

const numberButtons = document.querySelectorAll('[data-number]');
const operationButtons = document.querySelectorAll('[data-operator]');
const equalsButton = document.querySelector('[data-action="equals"]');
const deleteButton = document.querySelector('[data-action="delete"]');
const clearButton = document.querySelector('[data-action="clear"]');
const previousOperandTextElement = document.getElementById('previous-operand');
const currentOperandTextElement = document.getElementById('current-operand');

const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

// Add button animations
function animateButton(button) {
  button.classList.remove('animating');
  // Trigger reflow to restart animation
  void button.offsetWidth;
  button.classList.add('animating');
}

numberButtons.forEach(button => {
  button.addEventListener('click', () => {
    animateButton(button);
    calculator.appendNumber(button.dataset.number);
    calculator.updateDisplay();
  });
});

operationButtons.forEach(button => {
  button.addEventListener('click', () => {
    animateButton(button);
    calculator.chooseOperation(button.dataset.operator);
    calculator.updateDisplay();
  });
});

if (equalsButton) {
  equalsButton.addEventListener('click', button => {
    animateButton(equalsButton);
    calculator.compute();
    calculator.updateDisplay();
  });
}

if (clearButton) {
  clearButton.addEventListener('click', button => {
    animateButton(clearButton);
    calculator.clear();
    calculator.updateDisplay();
  });
}

if (deleteButton) {
  deleteButton.addEventListener('click', button => {
    animateButton(deleteButton);
    calculator.delete();
    calculator.updateDisplay();
  });
}

// Keyboard support
document.addEventListener('keydown', e => {
  if (e.key >= 0 && e.key <= 9 || e.key === '.') {
    const btn = Array.from(numberButtons).find(b => b.dataset.number === e.key);
    if (btn) {
      animateButton(btn);
      calculator.appendNumber(e.key);
      calculator.updateDisplay();
    }
  }
  
  if (e.key === '=' || e.key === 'Enter') {
    if (equalsButton) animateButton(equalsButton);
    calculator.compute();
    calculator.updateDisplay();
  }
  
  if (e.key === 'Backspace') {
    if (deleteButton) animateButton(deleteButton);
    calculator.delete();
    calculator.updateDisplay();
  }
  
  if (e.key === 'Escape') {
    if (clearButton) animateButton(clearButton);
    calculator.clear();
    calculator.updateDisplay();
  }
  
  if (['+', '-', '*', '/', '%'].includes(e.key)) {
    const btn = Array.from(operationButtons).find(b => b.dataset.operator === e.key);
    if (btn) {
      animateButton(btn);
      calculator.chooseOperation(e.key);
      calculator.updateDisplay();
    }
  }
});
