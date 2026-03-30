import { useState } from 'react';
import KoreanLunarCalendar from 'korean-lunar-calendar';
import { generateIcs, downloadIcs, type IcsEvent } from './ics';
import './App.css';

const MAX_YEAR = 2050;
const MIN_YEAR = 2000;

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

function App() {
  const [lunarMonth, setLunarMonth] = useState<string>('');
  const [lunarDay, setLunarDay] = useState<string>('');
  const [isIntercalation, setIsIntercalation] = useState(false);
  const [startYear, setStartYear] = useState<string>(new Date().getFullYear().toString());
  const [endYear, setEndYear] = useState<string>(MAX_YEAR.toString());
  const [eventTitle, setEventTitle] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [previewEvents, setPreviewEvents] = useState<IcsEvent[] | null>(null);

  const computeEvents = (): IcsEvent[] | null => {
    setError('');

    const m = Number.parseInt(lunarMonth);
    const d = Number.parseInt(lunarDay);
    const sy = Number.parseInt(startYear);
    const ey = Number.parseInt(endYear);

    if (!eventTitle.trim()) {
      setError('일정 제목을 입력해주세요.');
      return null;
    }

    if (!m || !d) {
      setError('음력 월과 일을 입력해주세요.');
      return null;
    }

    if (m < 1 || m > 12) {
      setError('월은 1~12 사이여야 합니다.');
      return null;
    }

    if (d < 1 || d > 30) {
      setError('일은 1~30 사이여야 합니다.');
      return null;
    }

    if (!sy || !ey) {
      setError('시작 년도와 종료 년도를 입력해주세요.');
      return null;
    }

    if (sy > ey) {
      setError('시작 년도가 종료 년도보다 클 수 없습니다.');
      return null;
    }

    if (ey > MAX_YEAR) {
      setError(`종료 년도는 ${MAX_YEAR}년을 넘을 수 없습니다.`);
      return null;
    }

    if (sy < MIN_YEAR) {
      setError(`시작 년도는 ${MIN_YEAR}년 이상이어야 합니다.`);
      return null;
    }

    const events: IcsEvent[] = [];

    for (let year = sy; year <= ey; year++) {
      const cal = new KoreanLunarCalendar();
      if (cal.setLunarDate(year, m, d, isIntercalation)) {
        const solar = cal.getSolarCalendar();
        events.push({
          summary: eventTitle.trim(),
          date: { year: solar.year, month: solar.month, day: solar.day },
        });
      }
    }

    if (events.length === 0) {
      setError('생성된 이벤트가 없습니다. 날짜를 확인해주세요.');
      return null;
    }

    return events;
  };

  const handlePreview = () => {
    const events = computeEvents();
    if (events) {
      setPreviewEvents(events);
    }
  };

  const handleGenerate = () => {
    const events = computeEvents();
    if (!events) return;

    const m = Number.parseInt(lunarMonth);
    const d = Number.parseInt(lunarDay);
    const sy = Number.parseInt(startYear);
    const ey = Number.parseInt(endYear);

    const icsContent = generateIcs(events);
    const filename = `lunar_${m}_${d}_${sy}_${ey}.ics`;
    downloadIcs(icsContent, filename);
  };

  const getDayOfWeek = (year: number, month: number, day: number): string => {
    const date = new Date(year, month - 1, day);
    return DAY_NAMES[date.getDay()];
  };

  return (
    <div className="container">
      <h1>음력 -&gt; 양력 반복 일정 ICS 생성기</h1>

      <div className="form-group">
        <label>일정 제목</label>
        <input
          type="text"
          placeholder="예: 어머니 생신"
          value={eventTitle}
          onChange={(e) => setEventTitle(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>음력 날짜</label>
        <div className="date-inputs">
          <input
            type="number"
            placeholder="월"
            min={1}
            max={12}
            value={lunarMonth}
            onChange={(e) => setLunarMonth(e.target.value)}
          />
          <span>월</span>
          <input
            type="number"
            placeholder="일"
            min={1}
            max={30}
            value={lunarDay}
            onChange={(e) => setLunarDay(e.target.value)}
          />
          <span>일</span>
        </div>
        <label className="intercalation-check">
          <input
            type="checkbox"
            checked={isIntercalation}
            onChange={(e) => setIsIntercalation(e.target.checked)}
          />
          윤달
        </label>
        <p className="hint">매년 반복할 음력 월/일을 입력하세요.</p>
      </div>

      <div className="form-group">
        <label>반복 생성 기간</label>
        <div className="year-range">
          <input
            type="number"
            placeholder="시작 년도"
            min={MIN_YEAR}
            max={MAX_YEAR}
            value={startYear}
            onChange={(e) => setStartYear(e.target.value)}
          />
          <span>~</span>
          <input
            type="number"
            placeholder="종료 년도"
            min={MIN_YEAR}
            max={MAX_YEAR}
            value={endYear}
            onChange={(e) => setEndYear(e.target.value)}
          />
        </div>
        <p className="hint">
          해당 기간 동안 매년 음력 날짜에 대응하는 양력 이벤트를 생성합니다. (최대 {MAX_YEAR}년)
        </p>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="button-group">
        <button className="preview-btn" onClick={handlePreview}>
          미리보기
        </button>
        <button className="generate-btn" onClick={handleGenerate}>
          ICS 생성
        </button>
      </div>

      {previewEvents && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>양력 변환 미리보기</h2>
              <button
                className="modal-close"
                onClick={() => setPreviewEvents(null)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <table className="preview-table">
                <thead>
                  <tr>
                    <th>양력 날짜</th>
                    <th>요일</th>
                  </tr>
                </thead>
                <tbody>
                  {previewEvents.map((event) => {
                    const { year, month, day } = event.date;
                    const dow = getDayOfWeek(year, month, day);
                    const dayOfWeek = new Date(year, month - 1, day).getDay();
                    let dayClass = '';
                    if (dayOfWeek === 0) dayClass = 'sunday';
                    else if (dayOfWeek === 6) dayClass = 'saturday';
                    return (
                      <tr key={`${year}-${month}-${day}`}>
                        <td>
                          {year}년 {month}월 {day}일
                        </td>
                        <td className={dayClass}>{dow}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
