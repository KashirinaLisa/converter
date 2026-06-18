import React, { useState, useRef } from 'react';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('Файл не выбран');
  const [loading, setLoading] = useState(false); // добавлено
  const [result, setResult] = useState<{ text: string; color: string }>({
    text: '▼ Здесь появится результат',
    color: '#666',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName('📎 ' + file.name);
    } else {
      setSelectedFile(null);
      setFileName('Файл не выбран');
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleConvert = () => {
    // Проверка на пустой файл (работает всегда, кнопка не заблокирована)
    if (!selectedFile) {
      setResult({ text: '⚠️ Сначала выберите файл!', color: '#d32f2f' });
      return;
    }
    setLoading(true);
    setResult({ text: '⏳ Идёт конвертация... (здесь будет реальный процесс)', color: '#1a73e8' });
    setTimeout(() => {
      setLoading(false);
      setResult({
        text: '✅ Конвертация завершена! <a href="#" style="color:#1a73e8;">Скачать PDF</a>',
        color: '#0a7a3a',
      });
    }, 1500);
  };

  return (
    <div className="container">
      <h1>📄 Конвертер DOC → PDF</h1>
      <p className="description">Загрузите файл .doc или .docx, и мы превратим его в PDF</p>

      <div className="upload-area" onClick={handleUploadClick}>
        <input
          type="file"
          accept=".doc,.docx"
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: 'none' }}
        />
        <label>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }}
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Нажмите, чтобы выбрать файл
        </label>
        <p className="file-name">{fileName}</p>
      </div>

      {/* Кнопка: блокируется только во время загрузки, текст меняется при выборе файла */}
      <button onClick={handleConvert} disabled={loading}>
        {selectedFile ? 'Конвертировать выбранный файл' : 'Конвертировать'}
      </button>

      <div
        className="result"
        style={{ color: result.color }}
        dangerouslySetInnerHTML={{ __html: result.text }}
      />
    </div>
  );
}

export default App;