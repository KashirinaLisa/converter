import React, { useState, useRef } from 'react';
import './App.css';

const USE_MOCK = true;

//  Сюда реальный адрес когда узнаю у  бэкенда при USE_MOCK = false !!!!!!!!!!!
const API_BASE = 'http://localhost:8080/api/v1';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('Файл не выбран');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ text: string; color: string }>({
    text: '▼ Здесь появится результат',
    color: '#666',
  });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setFileName('📎 ' + file.name);
    }
  };

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

  const handleConvert = async () => {
    if (!selectedFile) {
      setResult({ text: '⚠️ Сначала выберите файл!', color: '#d32f2f' });
      return;
    }

    setLoading(true);
    setResult({ text: '⏳ Обработка...', color: '#1a73e8' });

    if (USE_MOCK) {
      // ================== МОК-РЕЖИМ (имитация без бэка) ==================
      setTimeout(() => {
        setLoading(false);
        setResult({
          text: '✅ Конвертация завершена (МОК)! <a href="#" style="color:#1a73e8;">Скачать PDF</a>',
          color: '#0a7a3a',
        });
      }, 1500);
      return;
    }

    // ================== РЕАЛЬНЫЙ ЗАПРОС К БЭКЕНДУ ==================
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const uploadRes = await fetch(`${API_BASE}/conversions`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        let msg = 'Ошибка загрузки';
        if (uploadRes.status === 413) msg = 'Файл слишком большой (макс. 10 МБ)';
        else if (uploadRes.status === 415) msg = 'Неподдерживаемый формат файла';
        else if (uploadRes.status === 400) msg = 'Файл повреждён или пуст';
        throw new Error(msg);
      }

      const { id } = await uploadRes.json();
      setResult({ text: `✅ Задание создано (ID: ${id}). Ожидание...`, color: '#0a7a3a' });

      let status = 'PROCESSING';
      while (status === 'PROCESSING' || status === 'CREATED') {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const statusRes = await fetch(`${API_BASE}/conversions/${id}`);
        if (!statusRes.ok) throw new Error('Ошибка получения статуса');
        const data = await statusRes.json();
        status = data.status;
        setResult({ text: `⏳ Статус: ${status}...`, color: '#1a73e8' });
      }

      if (status === 'COMPLETED') {
        setResult({
          text: `✅ Конвертация завершена! <a href="${API_BASE}/conversions/${id}/result" style="color:#1a73e8;" download>Скачать PDF</a>`,
          color: '#0a7a3a',
        });
      } else if (status === 'FAILED') {
        setResult({ text: '❌ Конвертация не удалась.', color: '#d32f2f' });
      } else if (status === 'EXPIRED') {
        setResult({ text: '⏳ Время ожидания истекло.', color: '#d32f2f' });
      }
    } catch (error: any) {
      setResult({ text: `❌ Ошибка: ${error.message}`, color: '#d32f2f' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <div className="header-actions">{/* кнопки */}</div>
      </header>

      <main className="main-content">
        <div className="container">
          <h1>📄 Конвертер DOC → PDF</h1>
          <p className="description">Загрузите файл .doc или .docx, и мы превратим его в PDF</p>

          <div
            className={`upload-area ${isDragging ? 'dragging' : ''}`}
            onClick={handleUploadClick}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
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
              {isDragging ? 'Отпустите файл для загрузки' : 'Нажмите, чтобы выбрать файл'}
            </label>
            <p className="file-name">{fileName}</p>
          </div>

          <button onClick={handleConvert} disabled={loading}>
            {selectedFile ? 'Конвертировать выбранный файл' : 'Конвертировать'}
          </button>

          <div
            className="result"
            style={{ color: result.color }}
            dangerouslySetInnerHTML={{ __html: result.text }}
          />
        </div>
      </main>
    </div>
  );
}

export default App;