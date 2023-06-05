import { MouseEvent, useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Marker {
  name?: string;
  startX: number;
  startY: number;
  width: number;
  height: number;
}

interface MarkersMap {
  [key: string]: Marker;
}

function App() {
  const [markers, setMarkers] = useState<MarkersMap>({});
  const [startX, setStartX] = useState<number>(0);
  const [startY, setStartY] = useState<number>(0);
  const [drawing, setDrawing] = useState<string>('');
  const markerRef = useRef(null);

  const handleMouseDown = (event: MouseEvent) => {
    const { offsetX, offsetY } = event.nativeEvent;
    setStartX(offsetX);
    setStartY(offsetY);

    const id = uuidv4();
    setDrawing(id);
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (drawing) {
      const { offsetX, offsetY } = event.nativeEvent;
      const width = offsetX - startX;
      const height = offsetY - startY;

      if (markerRef.current) {
        cancelAnimationFrame(markerRef.current);
      }

      markerRef.current = requestAnimationFrame(() => {
        const newMarker = {
          id: drawing,
          startX,
          startY,
          width,
          height,
        };
        setMarkers((prevMarkers) => ({
          ...prevMarkers,
          [newMarker.id]: newMarker,
        }));
      });
    }
  };

  const handleMouseUp = (event: MouseEvent) => {
    setDrawing('');
    if (markerRef.current) {
      cancelAnimationFrame(markerRef.current);
      markerRef.current = null;
    }
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
                ref={markerRef}
                style={{
                  position: 'relative',
                  width: '500px',
                  height: '500px',
                  border: '1px solid black',
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              >
                <img
                  className='object-contain w-full h-full pointer-events-none'
                  src='https://picsum.photos/500/500'
                  style={{ width: '100%', height: '100%' }}
                />
                {Object.keys(markers).map((markerId) => {
                  const marker = markers[markerId];
                  return (
                    <div
                      key={markerId}
                      style={{
                        position: 'absolute',
                        left: marker.startX,
                        top: marker.startY,
                        width: marker.width,
                        height: marker.height,
                        border: '1px solid rgb(225, 89, 175)',
                        backgroundColor: 'rgba(225, 89, 175, 0.2)',
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
          <div className='sm:col-span-2 bg-slate-100 p-4'></div>
        </div>
      </main>
    </>
  );
}

export default App;
