import React, { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

interface CalculatorProps {
  windowId?: string;
  onClose?: () => void;
}

export const Calculator: React.FC<CalculatorProps> = ({ onClose: _onClose }) => {
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [display, setDisplay] = useState('0');

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const clearEntry = () => {
    setDisplay('0');
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
      
      // Add to history
      const historyEntry = `${currentValue} ${operation} ${inputValue} = ${newValue}`;
      setHistory(prev => [...prev.slice(-9), historyEntry]); // Keep last 10 entries
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return secondValue !== 0 ? firstValue / secondValue : 0;
      case '%':
        return firstValue % secondValue;
      default:
        return secondValue;
    }
  };

  const performEquals = () => {
    if (operation && previousValue !== null) {
      performOperation('=');
      setOperation(null);
      setPreviousValue(null);
      setWaitingForOperand(true);
    }
  };

  const performSpecialOperation = (op: string) => {
    const inputValue = parseFloat(display);
    let result: number;

    switch (op) {
      case '√':
        result = Math.sqrt(inputValue);
        break;
      case 'x²':
        result = inputValue * inputValue;
        break;
      case '1/x':
        result = inputValue !== 0 ? 1 / inputValue : 0;
        break;
      case '+/-':
        result = -inputValue;
        break;
      default:
        return;
    }

    setDisplay(String(result));
    setWaitingForOperand(true);
    
    // Add to history
    const historyEntry = `${op}(${inputValue}) = ${result}`;
    setHistory(prev => [...prev.slice(-9), historyEntry]);
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const { key } = event;
      
      if (key >= '0' && key <= '9') {
        inputNumber(key);
      } else if (key === '.') {
        inputDecimal();
      } else if (key === '+' || key === '-' || key === '*' || key === '/') {
        performOperation(key);
      } else if (key === 'Enter' || key === '=') {
        performEquals();
      } else if (key === 'Escape' || key === 'c' || key === 'C') {
        clear();
      } else if (key === 'Backspace') {
        if (display.length > 1) {
          setDisplay(display.slice(0, -1));
        } else {
          setDisplay('0');
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [display, operation, previousValue, waitingForOperand, inputNumber, inputDecimal, performOperation, performEquals]);

  const formatDisplay = (value: string) => {
    if (value.length > 12) {
      const num = parseFloat(value);
      if (num > 999999999999 || num < -999999999999) {
        return num.toExponential(6);
      }
    }
    return value;
  };

  const Button: React.FC<{
    onClick: () => void;
    className?: string;
    children: React.ReactNode;
    title?: string;
  }> = ({ onClick, className = '', children, title }) => (
    <button
      onClick={onClick}
      title={title}
      className={`
        h-12 rounded-lg font-medium text-sm transition-all duration-150
        hover:scale-105 active:scale-95 shadow-sm
        ${className}
      `}
    >
      {children}
    </button>
  );

  return (
    <div className="flex h-full bg-gray-900 text-white">
      {/* Main Calculator */}
      <div className="flex flex-col p-4 flex-1">
        {/* Display */}
        <div className="bg-black rounded-lg p-4 mb-4 min-h-[80px] flex flex-col justify-end">
          <div className="text-right">
            {operation && previousValue !== null && (
              <div className="text-gray-400 text-sm mb-1">
                {previousValue} {operation}
              </div>
            )}
            <div className="text-3xl font-mono overflow-hidden">
              {formatDisplay(display)}
            </div>
          </div>
        </div>

        {/* Button Grid */}
        <div className="grid grid-cols-4 gap-3 flex-1">
          {/* Row 1 */}
          <Button
            onClick={clear}
            className="bg-red-600 hover:bg-red-700 text-white col-span-2"
            title="Clear All (Esc)"
          >
            AC
          </Button>
          <Button
            onClick={clearEntry}
            className="bg-orange-600 hover:bg-orange-700 text-white"
            title="Clear Entry"
          >
            CE
          </Button>
          <Button
            onClick={() => performOperation('÷')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            title="Divide (/)"
          >
            ÷
          </Button>

          {/* Row 2 */}
          <Button
            onClick={() => inputNumber('7')}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            7
          </Button>
          <Button
            onClick={() => inputNumber('8')}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            8
          </Button>
          <Button
            onClick={() => inputNumber('9')}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            9
          </Button>
          <Button
            onClick={() => performOperation('×')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            title="Multiply (*)"
          >
            ×
          </Button>

          {/* Row 3 */}
          <Button
            onClick={() => inputNumber('4')}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            4
          </Button>
          <Button
            onClick={() => inputNumber('5')}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            5
          </Button>
          <Button
            onClick={() => inputNumber('6')}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            6
          </Button>
          <Button
            onClick={() => performOperation('-')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            title="Subtract (-)"
          >
            −
          </Button>

          {/* Row 4 */}
          <Button
            onClick={() => inputNumber('1')}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            1
          </Button>
          <Button
            onClick={() => inputNumber('2')}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            2
          </Button>
          <Button
            onClick={() => inputNumber('3')}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            3
          </Button>
          <Button
            onClick={() => performOperation('+')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            title="Add (+)"
          >
            +
          </Button>

          {/* Row 5 */}
          <Button
            onClick={() => performSpecialOperation('+/-')}
            className="bg-gray-600 hover:bg-gray-500 text-white"
            title="Change Sign"
          >
            +/−
          </Button>
          <Button
            onClick={() => inputNumber('0')}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            0
          </Button>
          <Button
            onClick={inputDecimal}
            className="bg-gray-700 hover:bg-gray-600 text-white"
            title="Decimal Point (.)"
          >
            .
          </Button>
          <Button
            onClick={performEquals}
            className="bg-green-600 hover:bg-green-700 text-white"
            title="Equals (Enter)"
          >
            =
          </Button>

          {/* Scientific Functions Row */}
          <Button
            onClick={() => performSpecialOperation('√')}
            className="bg-purple-600 hover:bg-purple-700 text-white"
            title="Square Root"
          >
            √
          </Button>
          <Button
            onClick={() => performSpecialOperation('x²')}
            className="bg-purple-600 hover:bg-purple-700 text-white"
            title="Square"
          >
            x²
          </Button>
          <Button
            onClick={() => performSpecialOperation('1/x')}
            className="bg-purple-600 hover:bg-purple-700 text-white"
            title="Reciprocal"
          >
            1/x
          </Button>
          <Button
            onClick={() => performOperation('%')}
            className="bg-purple-600 hover:bg-purple-700 text-white"
            title="Modulo"
          >
            %
          </Button>
        </div>
      </div>

      {/* History Panel */}
      <div className="w-64 bg-gray-800 border-l border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">History</h3>
          <button
            onClick={() => setHistory([])}
            className="p-1 text-gray-400 hover:text-white rounded"
            title="Clear History"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {history.length === 0 ? (
            <p className="text-gray-500 text-sm">No calculations yet</p>
          ) : (
            history.slice().reverse().map((entry, index) => (
              <div
                key={index}
                className="p-2 bg-gray-700 rounded text-sm font-mono cursor-pointer hover:bg-gray-600"
                onClick={() => {
                  const result = entry.split(' = ')[1];
                  if (result) {
                    setDisplay(result);
                    setWaitingForOperand(true);
                  }
                }}
              >
                {entry}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
