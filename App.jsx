import { useState, useEffect } from "react"
import { decode } from "html-entities"

export default function App() {
    const url = "https://opentdb.com/api.php?amount=5&difficulty=easy&type=multiple"
    const [quizStatus, setQuizStatus] = useState("")
    const [questions, setQuestions] = useState([])
    const [answers, setAnswers] = useState([])
    const correctAnswers = questions.map(questionObj => questionObj.correct_answer)
    const userAnswers = answers.map((answersArray, index) => 
        answersArray.some(answerObj => 
            answerObj.isSelected && answerObj.answer === correctAnswers[index]
        )).filter(isCorrect => isCorrect)
    const questionsCompleted = answers.map(answersArray => 
        answersArray.some(answerObj => answerObj.isSelected))
    const allQuestionsCompleted = questionsCompleted.every(completed => completed)

    useEffect(() => {
            fetch(url)
                .then(res => res.json())
                .then(data => setQuestions(data.results))
    }, [])

    useEffect(() => {
        setAnswers(
            questions.map((questionObj) => {
                const answersArray = questionObj.incorrect_answers
                answersArray.splice(Math.floor(Math.random() * 
                    (answersArray.length + 1)), 0, questionObj.correct_answer)
                return (
                        answersArray.map((answer) => ({
                            answer: answer, isSelected: false}))
                )
            })
        )
    }, [questions])

    function clickStartQuiz () {
        setQuizStatus("starting")
    }

    function giveAnswer(questionIndex, answerIndex) {
        setAnswers(prevAnswers => {
            const newAnswers = [...prevAnswers]
            newAnswers[questionIndex] = newAnswers[questionIndex].map((answerObj, index) => {
                return index === answerIndex ? 
                    {...answerObj, isSelected: !answerObj.isSelected} :
                    answerObj
            })
            return newAnswers
        })
    }

    function clickLargeButton() {
         if (quizStatus === "starting") {
            setQuizStatus("checking")
         } 
         if (quizStatus === "checking") {
            fetch(url)
                .then(res => res.json())
                .then(data => setQuestions(data.results))
            setQuizStatus("starting")  
         }
    }
    
    function Intro () {
        return (
             <section className="intro">
                <h1>Quizzical</h1>
                <p>Play and test your knowledge with fun interactive quiz!</p>
                <button className="large-button" onClick={clickStartQuiz}>Start quiz</button>
            </section>
        )
    }

    function Questions() {
        const questionElements = questions.map((questionObj, questionIndex) => (
                <div key={questionIndex} className="question">
                    <h2>{decode(questionObj.question)}</h2>
                    <div className="answers">
                        {answers[questionIndex].map((answerObj, answerIndex) => (
                                <button 
                                    disabled={(questionsCompleted[questionIndex] && !answerObj.isSelected) || quizStatus === "checking"}
                                    key={answerIndex} 
                                    className={quizStatus === "starting" && answerObj.isSelected ? "selected" : 
                                        quizStatus === "checking" && answerObj.answer === correctAnswers[questionIndex] ? 
                                            "correct" :
                                        quizStatus === "checking" && answerObj.isSelected && 
                                            answerObj.answer !== correctAnswers[questionIndex] ? "incorrect disabled" :
                                        questionsCompleted[questionIndex] ? "disabled" : ""}
                                    onClick={() => giveAnswer(questionIndex, answerIndex)}
                                >
                                    {decode(answerObj.answer)}
                                </button>
                            )
                        )}
                    </div>
                </div>
        ))
        return (
            <section className="questions">
                {questionElements}
                <div className="results">
                    {quizStatus === "checking" && 
                        <p>You scored {userAnswers.length}/{questions.length} correct answers</p>}
                    <button 
                        disabled={!allQuestionsCompleted}
                        className={allQuestionsCompleted ? "large-button" : "large-button disabled"}
                        onClick={() => clickLargeButton()}
                    >
                        {quizStatus === "starting" ? "Check answers" : "Play again"}
                    </button>
                </div>
            </section>
        )
    }

    return (
        <main>
            {quizStatus === "" && Intro()}
            {quizStatus !== "" && Questions()}
        </main>
    )
}