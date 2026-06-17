"use client";

import React, { useState } from "react";
import "./faq.css";

const faqData = [
  {
    question: "What exactly is Campus2Corporate (C2C) and who is eligible to join?",
    answer: "C2C is a comprehensive, multi-phase online placement readiness program designed by IEEE WIE SBC and IEEE SB CE Kidangoor. Spanning over 4-5 months with 5 distinct phases and 8+ live mentorship sessions, the program is open to all students across all academic years—from first to final year—pursuing engineering or related technical and professional courses."
  },
  {
    question: "How can I get my ₹500 registration fee fully refunded?",
    answer: (
      <>
        To qualify for a full refund, you must achieve The Excellence Tier. This requires maintaining a 100% completion rate for all daily quizzes and phase assignments, attending all mandatory live sessions, and securing a cumulative final average score of &ge; 70% total marks.
      </>
    )
  },
  {
    question: "What happens if I miss a daily assignment deadline or a live session?",
    answer: "C2C relies on an Unbroken Consistency rule. Daily tasks have a nightly 11:59 PM deadline, with a capped grace period until 11:59 AM the next morning. Missing a morning cutoff, skipping an assignment, or missing a mandatory live session permanently breaks your streak and forfeits all eligibility for certification or refunds."
  },
  {
    question: "I am applying through the Scholarship track. Do I still need to use the regular registration link?",
    answer: "No. If you are applying for financial aid, please use the dedicated Scholarship Registration portal only. You do not need to register or pay through the standard registration portal."
  },
  {
    question: "Can I get a deadline extension if my university semester exams overlap with the program?",
    answer: "Yes, we accommodate hectic academic schedules. If an official university exam or a medical emergency conflicts with a deadline or live session, you must contact the organizing team at least 48 hours in advance to request an official extension window."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-container" id="faq">
      <div className="faq-content">
        <div className="faq-header">
          <h2 className="faq-title">FAQs</h2>
          <p className="faq-subtitle">
            Frequently Asked Questions.<br />
            Here are some common questions about Campus2Corporate.
          </p>
        </div>
        <div className="faq-list">
          {faqData.map((faq, index) => (
            <div key={index} className={`faq-item ${openIndex === index ? 'open' : ''}`}>
              <div className="faq-question" onClick={() => toggleQuestion(index)}>
                <span>{faq.question}</span>
                <div className="faq-q-icon-wrapper">
                  <span className="faq-plus-icon">{openIndex === index ? '−' : '+'}</span>
                </div>
              </div>
              <div className={`faq-answer-wrapper ${openIndex === index ? 'open' : ''}`}>
                <div className="faq-answer-inner">
                  <div className="faq-answer">
                    {faq.answer}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
