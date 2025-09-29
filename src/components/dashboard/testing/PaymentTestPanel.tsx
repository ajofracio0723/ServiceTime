import React, { useState } from 'react';
import { Play, CheckCircle, XCircle, Clock, RefreshCw, Bug } from 'lucide-react';
import { paymentTestRunner, type TestResult } from '../../../utils/paymentTestScenarios';

interface TestResultWithName extends TestResult {
  name: string;
}

export const PaymentTestPanel: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResultWithName[]>([]);
  const [summary, setSummary] = useState<{ passed: number; failed: number } | null>(null);

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);
    setSummary(null);

    try {
      const testResults = await paymentTestRunner.runAllTests();
      setResults(testResults.results);
      setSummary({ passed: testResults.passed, failed: testResults.failed });
    } catch (error) {
      console.error('Test execution failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runSingleTest = async (testName: string) => {
    setIsRunning(true);
    
    try {
      const result = await paymentTestRunner.runTest(testName);
      if (result) {
        setResults(prev => {
          const filtered = prev.filter(r => r.name !== testName);
          return [...filtered, result];
        });
      }
    } catch (error) {
      console.error(`Test ${testName} failed:`, error);
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setSummary(null);
  };

  const getResultIcon = (result: TestResultWithName) => {
    if (result.passed) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else {
      return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getResultColor = (result: TestResultWithName) => {
    return result.passed 
      ? 'border-green-200 bg-green-50' 
      : 'border-red-200 bg-red-50';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <Bug className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Payment System Tests</h3>
            <p className="text-sm text-gray-600">Validate payment workflows and business logic</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={clearResults}
            disabled={isRunning || results.length === 0}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear
          </button>
          <button
            onClick={runAllTests}
            disabled={isRunning}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Run All Tests</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Test Summary */}
      {summary && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Test Results Summary</h4>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span className="font-medium">{summary.passed} Passed</span>
              </div>
              <div className="flex items-center text-red-600">
                <XCircle className="w-4 h-4 mr-1" />
                <span className="font-medium">{summary.failed} Failed</span>
              </div>
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${summary.passed + summary.failed > 0 ? (summary.passed / (summary.passed + summary.failed)) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Individual Tests */}
      <div className="space-y-4">
        {paymentTestRunner.getTestNames().map((testName) => {
          const result = results.find(r => r.name === testName);
          
          return (
            <div
              key={testName}
              className={`border rounded-lg p-4 transition-all duration-200 ${
                result ? getResultColor(result) : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {result ? (
                    getResultIcon(result)
                  ) : (
                    <Clock className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <h5 className="font-medium text-gray-900">{testName}</h5>
                    {result && (
                      <p className={`text-sm mt-1 ${
                        result.passed ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {result.message}
                      </p>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => runSingleTest(testName)}
                  disabled={isRunning}
                  className="px-3 py-1 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Run
                </button>
              </div>
              
              {result && result.details && (
                <div className="mt-3 p-3 bg-white rounded border">
                  <h6 className="text-xs font-medium text-gray-700 mb-2">Details:</h6>
                  <pre className="text-xs text-gray-600 overflow-x-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {results.length === 0 && !isRunning && (
        <div className="text-center py-8 text-gray-500">
          <Bug className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Click "Run All Tests" to validate payment system functionality</p>
        </div>
      )}
    </div>
  );
};
