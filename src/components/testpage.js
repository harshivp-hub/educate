import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const TakeTestPage = () => {
  const { _id } = useParams(); // Use useParams to get the testId from the URL
  const [test, setTest] = useState(null);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTest();
  }, []);

  const fetchTest = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/tests/${_id}`);
      console.log('Fetch test response:', response); // Log the response object
      if (!response.ok) {
        throw new Error('Failed to fetch test details');
      }
      const data = await response.json();
      console.log('Fetched test data:', data); // Log the fetched data
      setTest(data);
      initializeResponses(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching test:', error);
      setError('Failed to fetch test details');
    }
  };
  

  const initializeResponses = (data) => {
    const initialResponses = {};
    data.questions.forEach((question) => {
      initialResponses[question._id] = '';
    });
    setResponses(initialResponses);
  };

  const handleOptionChange = (questionId, choice) => {
    setResponses({
      ...responses,
      [questionId]: choice,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('User Responses:', responses);
    // Add logic to send responses to the backend or perform other actions
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="take-test-page-container">
      <h1>Test: {test.subject}</h1>
      <form onSubmit={handleSubmit}>
        <h2>Questions:</h2>
        <ul>
          {test.questions.map((question, index) => (
            <li key={question._id}>
              <strong>Q: {question.question}</strong>
              <ul>
                {question.choices.map((choice, i) => (
                  <li key={i}>
                    <label>
                      <input
                        type="radio"
                        name={`question_${question._id}`}
                        value={choice}
                        checked={responses[question._id] === choice}
                        onChange={() => handleOptionChange(question._id, choice)}
                      />
                      {choice}
                    </label>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default TakeTestPage;
