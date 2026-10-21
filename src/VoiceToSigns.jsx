
import { useEffect, useState } from 'react';

function VoiceToSigns() {
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [error, setError] = useState('');

  const SpeechRecognition =
    typeof window !== 'undefined'
      ? window.SpeechRecognition ||
        window.webkitSpeechRecognition
      : null;

  useEffect(() => {
    return () => {
      // إيقاف التسجيل عند مغادرة المكوّن
    };
  }, []);

  function startListening() {
    setError('');

    if (!SpeechRecognition) {
      setError(
        'المتصفح لا يدعم التعرف على الصوت. جرّب Google Chrome.'
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = 'ar-EG';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event) => {
      let text = '';

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        text += event.results[i][0].transcript;
      }

      setTranscript(text);
    };

    recognition.onerror = (event) => {
      setError(
        event.error === 'not-allowed'
          ? 'اسمح للمتصفح باستخدام الميكروفون.'
          : `تعذر التعرف على الصوت: ${event.error}`
      );
    };

    recognition.onend = () => setListening(false);

    try {
      recognition.start();
    } catch {
      setListening(false);
      setError('تعذر بدء التسجيل. حاول مرة أخرى.');
    }
  }

  return (
    <section className="voice-to-signs" dir="rtl">
      <h2>الصوت إلى الإشارة</h2>

      <p>
        اتكلم بالعربي، وسيظهر الكلام المكتشف هنا.
      </p>

      <button
        type="button"
        onClick={startListening}
        disabled={listening}
      >
        {listening ? 'جاري الاستماع...' : '🎙️ ابدأ التحدث'}
      </button>

      <div className="voice-result" aria-live="polite">
        <h3>النص المكتشف</h3>

        <p>
          {transcript || 'النص الذي تقوله سيظهر هنا.'}
        </p>
      </div>

      {error && <p role="alert">{error}</p>}
    </section>
  );
}

export default VoiceToSigns;
