import { MouseEvent, useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Color {
  r: number;
  g: number;
  b: number;
}

interface Marker {
  id: string;
  startX: number;
  startY: number;
  width: number;
  height: number;
  color: Color;
  name?: string;
}

interface MarkersMap {
  [key: string]: Marker;
}

function getRandomRgb() {
  const num = Math.round(0xffffff * Math.random());
  const r = num >> 16;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return {
    r,
    g,
    b,
  };
}

function App() {
  const [markers, setMarkers] = useState<MarkersMap>({});
  const [startX, setStartX] = useState<number>(0);
  const [startY, setStartY] = useState<number>(0);
  const [markerId, setDrawingMarkerId] = useState<string>('');
  const [editingMarkerId, setEditingMarkerId] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  const [color, setColor] = useState<Color>({
    r: 0,
    g: 0,
    b: 0,
  });

  const markerRef = useRef(null);

  const addStartMarking = () => {
    setIsDrawing(true);
  };

  const handleMouseDown = (event: MouseEvent) => {
    if (isDrawing && !markerId && !markerRef.current) {
      const { offsetX, offsetY } = event.nativeEvent;
      setStartX(offsetX);
      setStartY(offsetY);
      const id = uuidv4();
      const color = getRandomRgb();
      setColor(color);
      setDrawingMarkerId(id);
    }
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (markerId && isDrawing) {
      const { offsetX, offsetY } = event.nativeEvent;
      const width = offsetX - startX;
      const height = offsetY - startY;

      if (markerRef.current) {
        cancelAnimationFrame(markerRef.current);
      }

      markerRef.current = requestAnimationFrame(() => {
        const newMarker = {
          id: markerId,
          startX: width >= 0 ? startX : offsetX,
          startY: height >= 0 ? startY : offsetY,
          width: Math.abs(width),
          height: Math.abs(height),
          color,
          name: '',
        };

        setMarkers((prevMarkers) => ({
          ...prevMarkers,
          [newMarker.id]: newMarker,
        }));
      });
    }
  };

  const handleMouseUp = (event: MouseEvent) => {
    if (markerRef.current && markerId && isDrawing) {
      const { offsetX, offsetY } = event.nativeEvent;
      const width = offsetX - startX;
      const height = offsetY - startY;

      const newMarker = {
        name: '',
        id: markerId,
        startX: width >= 0 ? startX : offsetX,
        startY: height >= 0 ? startY : offsetY,
        width: Math.abs(width),
        height: Math.abs(height),
        color,
      };

      setMarkers((prevMarkers) => ({
        ...prevMarkers,
        [newMarker.id]: newMarker,
      }));

      cancelAnimationFrame(markerRef.current);
      markerRef.current = null;
      setDrawingMarkerId('');
      setStartX(0);
      setStartY(0);
      setColor({
        r: 0,
        g: 0,
        b: 0,
      });
      setIsDrawing(false);
    }
  };

  const handleNameChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    markerId: string
  ) => {
    const { value } = event.target;

    setMarkers((prevMarkers) => ({
      ...prevMarkers,
      [markerId]: {
        ...prevMarkers[markerId],
        name: value,
      },
    }));
  };

  return (
    <>
      <header className='max-w-full mx-auto'>
        <nav className='flex items-center justify-between flex-wrap bg-slate-950 px-8 py-4'>
          <div className='flex items-center flex-shrink-0 text-white mr-6'>
            <span className='font-semibold text-xl tracking-tight'>
              Marker App
            </span>
          </div>
        </nav>
      </header>
      <main className='max-w-8xl mx-auto'>
        <div className='grid w-full sm:grid-cols-6 min-h-screen'>
          <div className='sm:col-span-4 bg-white'>
            <div className='flex items-center justify-center'>
              <div
                className={`mt-4 z-50 ${isDrawing ? 'cursor-crosshair' : ''}`}
                style={{
                  position: 'relative',
                  width: '800px',
                  height: '600px',
                  border: '1px solid black',
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              >
                <img
                  className='object-contain w-full -z-10 h-full pointer-events-none'
                  src='https://picsum.photos/800/600'
                  style={{ width: '100%', height: '100%' }}
                />
                {Object.keys(markers).map((markerId) => {
                  const marker = markers[markerId];
                  return (
                    <div
                      key={markerId}
                      onClick={() => {
                        setEditingMarkerId(marker.id);
                      }}
                      style={{
                        pointerEvents: isDrawing ? 'none' : 'auto',
                        position: 'absolute',
                        left: marker.startX,
                        top: marker.startY,
                        width: marker.width,
                        height: marker.height,
                        border: `2px solid rgb(${marker.color.r}, ${marker.color.g}, ${marker.color.b})`,
                        backgroundColor: `rgba(${marker.color.r}, ${marker.color.g}, ${marker.color.b}, 0.2)`,
                      }}
                    >
                      {markerId === editingMarkerId ? (
                        <input
                          type='text'
                          autoFocus
                          value={markers[markerId].name}
                          onChange={(event) =>
                            handleNameChange(event, markerId)
                          }
                          onBlur={() => setEditingMarkerId('')}
                        />
                      ) : (
                        <div
                          style={{
                            position: 'absolute',
                            top: '-1.5em',
                            width: '100%',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            color: 'white',
                            textShadow: '1px 1px 2px black',
                          }}
                        >
                          {marker.name}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className='flex items-center justify-center'>
              <button
                onClick={addStartMarking}
                className='mt-4 ml-4 bg-indigo-700 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded'
              >
                Add a new marker
              </button>
            </div>
          </div>
          <div className='sm:col-span-2 bg-slate-100 p-4'></div>
        </div>
      </main>
    </>
  );
}

export default App;
