

import { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';

const API_URL = 'http://127.0.0.1:8000/predict';

const ARABIC_LABELS = {
  ain: 'ع',
  al: 'ال',
  aleff: 'أ',
  bb: 'ب',
  dal: 'د',
  dha: 'ظ',
  dhad: 'ض',
  fa: 'ف',
  gaaf: 'ق',
  ghain: 'غ',
  ha: 'ه',
  haa: 'ح',
  jeem: 'ج',
  kaaf: 'ك',
  khaa: 'خ',
  la: 'ل',
  laam: 'ل',
  meem: 'م',
  nun: 'ن',
  ra: 'ر',
  saad: 'ص',
  seen: 'س',
  sheen: 'ش',
  ta: 'ط',
  taa: 'ت',
  thaa: 'ث',
  thal: 'ذ',
  toot: 'ة',
  waw: 'و',
  ya: 'ئ',
  yaa: 'ي',
  zay: 'ز',
};

const CAPTURE_INTERVAL = 1200;
const REQUIRED_STABLE_READS = 3;
const MIN_CONFIDENCE = 70;

function HandDetection() {
  const webcamRef = useRef(null);
  const busyRef = useRef(false);
  const previousClassRef = useRef('');
  const stableCountRef = useRef(0);
  const lastAddedClassRef = useRef('');

  const [predictions, setPredictions] = useState([]);
  const [word, setWord] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(
    'اسمح باستخدام الكاميرا واظهر إشارة يدك أمامها.'
  );

  useEffect(() => {
    let active = true;

    async function analyzeFrame() {
      if (busyRef.current || !webcamRef.current) return;

      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return;

      busyRef.current = true;
      if (active) setLoading(true);

      try {
        const imageResponse = await fetch(imageSrc);
        const imageBlob = await imageResponse.blob();

        const formData = new FormData();
        formData.append('file', imageBlob, 'camera-capture.jpg');

        const response = await fetch(API_URL, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || 'فشل تحليل الصورة.');
        }

        const topPrediction = data.predictions?.[0];

        if (!topPrediction || !active) return;

        setPredictions(data.predictions);

        const className = topPrediction.class_name;
        const confidence = Number(topPrediction.confidence) || 0;

        if (confidence < MIN_CONFIDENCE) {
          previousClassRef.current = '';
          stableCountRef.current = 0;
          setMessage('الإشارة غير واضحة. قرّب يدك من الكاميرا.');
          return;
        }

        if (className === previousClassRef.current) {
          stableCountRef.current += 1;
        } else {
          previousClassRef.current = className;
          stableCountRef.current = 1;
        }

        if (stableCountRef.current >= REQUIRED_STABLE_READS) {
          if (lastAddedClassRef.current !== className) {
            const arabicLetter =
              ARABIC_LABELS[className] ?? className;

            setWord((currentWord) => currentWord + arabicLetter);
            lastAddedClassRef.current = className;
            setMessage(`تمت إضافة الحرف: ${arabicLetter}`);
          } else {
            setMessage('الإشارة ثابتة. غيّر إشارة يدك لإضافة الحرف التالي.');
          }
        } else {
          setMessage('جارٍ التأكد من ثبات الحرف...');
        }
      } catch (err) {
        if (active) {
          setError(
            err.message ||
              'تعذر الاتصال بالـBackend. تأكد أنه يعمل.'
          );
        }
      } finally {
        busyRef.current = false;
        if (active) setLoading(false);
      }
    }

    const intervalId = setInterval(
      analyzeFrame,
      CAPTURE_INTERVAL
    );

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, []);

  function clearWord() {
    setWord('');
    lastAddedClassRef.current = '';
    previousClassRef.current = '';
    stableCountRef.current = 0;
    setError('');
    setMessage('تم مسح النص. ابدأ بإشارة جديدة.');
  }

  function undoLastLetter() {
    setWord((currentWord) => Array.from(currentWord).slice(0, -1).join(''));
    lastAddedClassRef.current = '';
    previousClassRef.current = '';
    stableCountRef.current = 0;
    setMessage('تقدر تكمل بإشارة جديدة.');
  }

  return (
    <section className="hand-detection">
      <div className="camera-container">
        <Webcam
          ref={webcamRef}
          audio={false}
          mirrored
          screenshotFormat="image/jpeg"
          screenshotQuality={0.8}
          videoConstraints={{
            facingMode: 'user',
            width: 640,
            height: 480,
          }}
          style={{
            display: 'block',
            width: '100%',
            maxWidth: '640px',
            margin: '0 auto',
            borderRadius: '16px',
          }}
        />
      </div>

      <p>{message}</p>

      <p style={{ fontSize: '14px' }}>
        {loading ? 'جارٍ تحليل الصورة...' : 'التعرف التلقائي يعمل'}
      </p>

      {error && (
        <p role="alert" style={{ color: '#dc2626' }}>
          {error}
        </p>
      )}

      <div
        style={{
          maxWidth: '640px',
          margin: '20px auto',
          padding: '20px',
          borderRadius: '14px',
          background: '#f3f4f6',
          color: '#111827',
          textAlign: 'center',
        }}
      >
        <h2>النص المكتشف</h2>

        <p
          dir="rtl"
          aria-live="polite"
          style={{
            minHeight: '55px',
            fontSize: '32px',
            fontWeight: 'bold',
            overflowWrap: 'anywhere',
          }}
        >
          {word || 'ستظهر الحروف هنا'}
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <button type="button" onClick={undoLastLetter}>
            تراجع عن آخر حرف
          </button>

          <button type="button" onClick={clearWord}>
            مسح النص
          </button>
        </div>
      </div>

      {predictions.length > 0 && (
        <div
          style={{
            maxWidth: '640px',
            margin: '20px auto',
            direction: 'rtl',
          }}
        >
          <h3>آخر التوقعات</h3>

          {predictions.map((prediction, index) => (
            <div
              key={`${prediction.class_name}-${index}`}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px',
                margin: '8px 0',
                borderRadius: '8px',
                background: '#f3f4f6',
                color: '#111827',
              }}
            >
              <span>
                {ARABIC_LABELS[prediction.class_name] ??
                  prediction.class_name}
              </span>

              <span dir="ltr">
                {Number(prediction.confidence).toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      )}

      <p style={{ fontSize: '13px', textAlign: 'center' }}>
        النموذج يتعرف على صور ثابتة. تكوين النص هنا تجريبي
        ويحتاج اختبارًا للتأكد من صحة الحروف وترتيبها.
      </p>
    </section>
  );
}

export default HandDetection;
