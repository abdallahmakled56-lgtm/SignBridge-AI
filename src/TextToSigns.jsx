
import { useState } from 'react';

const SIGN_IMAGES = {
  س: '/signs/seen.JPG',
  ل: '/signs/laam.JPG',
  ا: '/signs/aleff.JPG',
  م: '/signs/meem.JPG',
};

function TextToSigns() {
  const [text, setText] = useState('سلام');
  const [letters, setLetters] = useState(['س', 'ل', 'ا', 'م']);

  function convertText() {
    const arabicLetters = Array.from(text).filter(
      (char) => /[\u0621-\u064A]/.test(char)
    );

    setLetters(arabicLetters);
  }

  return (
    <section className="text-to-signs" dir="rtl">
      <h2>تحويل النص إلى إشارات</h2>
      <p>اكتب نصًا عربيًا لعرض صور الإشارات المتاحة.</p>

      <input
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="اكتب كلمة بالعربي"
        aria-label="النص العربي"
      />

      <button type="button" onClick={convertText}>
        عرض الإشارات
      </button>

      <div className="signs-grid">
        {letters.map((letter, index) => {
          const image = SIGN_IMAGES[letter];

          return (
            <div className="sign-card" key={`${letter}-${index}`}>
              {image ? (
                <img
                  src={image}
                  alt={`صورة إشارة الحرف ${letter}`}
                  width="150"
                  height="150"
                  style={{ objectFit: 'contain' }}
                />
              ) : (
                <p>لا توجد صورة إشارة متاحة لهذا الحرف.</p>
              )}

              <p>الحرف: {letter}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default TextToSigns;
