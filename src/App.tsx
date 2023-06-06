import { MouseEvent, useState, useRef, useLayoutEffect } from 'react';
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
  const random = Math.random() * (1 - 0.6) + 0.6;
  const num = Math.round(0xffffff * random);
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

  const markerRef = useRef(0);

  const reset = () => {
    cancelAnimationFrame(markerRef.current);
    markerRef.current = 0;
    setDrawingMarkerId('');
    setStartX(0);
    setStartY(0);
    setColor({
      r: 0,
      g: 0,
      b: 0,
    });
    setIsDrawing(false);
  };

  useLayoutEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        reset();
      }

      // press R to add a new marker
      if (event.key === 'r' && !isDrawing && !editingMarkerId) {
        addStartMarking();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDrawing, editingMarkerId]);

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
      reset();
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
                className={`z-50 p-2 ${isDrawing ? 'cursor-crosshair' : ''}`}
                style={{
                  position: 'relative',
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              >
                <img
                  className='object-contain w-full -z-10 h-full pointer-events-none'
                  src='/road.jpg'
                  style={{ width: '100%', height: '100%' }}
                />
                {Object.keys(markers).map((markerId) => {
                  const marker = markers[markerId];
                  return (
                    <div
                      key={markerId}
                      className='flex items-center justify-center'
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
                        backgroundColor: `rgba(${marker.color.r}, ${marker.color.g}, ${marker.color.b}, 0.35)`,
                        zIndex: markerId === editingMarkerId ? 100 : 'auto',
                      }}
                    >
                      {markerId === editingMarkerId ? (
                        <input
                          className='bg-transparent text-sm border-none text-white w-full text-center outline-none px-1 py-0.5'
                          type='text'
                          autoFocus
                          value={markers[markerId].name}
                          onChange={(event) => {
                            handleNameChange(event, markerId);
                          }}
                          onBlur={() => setEditingMarkerId('')}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              setEditingMarkerId('');
                            }
                          }}
                        />
                      ) : marker.name !== '' ? (
                        <div
                          className='text-sm font-medium px-1 pt-1 break-words'
                          style={{
                            position: 'absolute',
                            top: '-2px',
                            width: '100%',
                            textAlign: 'left',
                            color: 'white',
                            border: `2px solid rgb(${marker.color.r}, ${marker.color.g}, ${marker.color.b})`,
                            backgroundColor: `rgb(${marker.color.r}, ${marker.color.g}, ${marker.color.b})`,
                            opacity: 1,
                          }}
                        >
                          {marker.name}
                        </div>
                      ) : (
                        <p className='text-center text-xs text-white'>
                          Click to add a name
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className='flex items-center justify-center'>
              <button
                disabled={isDrawing || editingMarkerId !== ''}
                onClick={addStartMarking}
                className='bg-purple-800 hover:bg-purple-700 text-white py-2 px-4 rounded-sm disabled:bg-purple-600 disabled:cursor-not-allowed'
              >
                Add Marker (Press R)
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
