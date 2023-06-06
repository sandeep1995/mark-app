import { MouseEvent, useState, useRef, useLayoutEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  BiCrop,
  BiDownload,
  BiEdit,
  BiEraser,
  BiTrash,
  BiUpload,
} from 'react-icons/bi';

import { Color, MarkersMap, Marker, getRandomRgb } from './utils/index';

function App() {
  const [imageSrc, setImageSrc] = useState<string>('');
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
    setEditingMarkerId('');
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
        startMarking();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDrawing, editingMarkerId]);

  const startMarking = () => {
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
        const newMarker: Marker = {
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

      const newMarker: Marker = {
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

  const handleDeleteMarker = (markerId: string) => {
    setMarkers((prevMarkers) => {
      const newMarkers = { ...prevMarkers };
      delete newMarkers[markerId];
      return newMarkers;
    });
    setTimeout(() => {
      reset();
    }, 0);
  };

  const uploadImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const image = new Image();
        image.src = reader.result as string;
        image.onload = () => {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = image.width;
          canvas.height = image.height;
          context?.drawImage(image, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          setImageSrc(dataUrl);
        };
      };
    };
    input.click();
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

          <div className='flex items-center'>
            <button
              onClick={() => {
                reset();
                setMarkers({});
                setImageSrc('');
              }}
              className='mr-4 py-2 px-4 text-white bg-indigo-700'
            >
              <BiEraser className='inline-block mr-2' />
              Reset
            </button>
            <button
              onClick={uploadImage}
              className='mr-4 py-2 px-4 text-white bg-indigo-700'
            >
              <BiUpload className='inline-block mr-2' />
              Upload Image
            </button>
          </div>
        </nav>
      </header>
      <main className='max-w-8xl mx-auto'>
        {imageSrc ? (
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
                    className='object-contain w-full -z-10 h-full max-h-[80vh] pointer-events-none'
                    src={imageSrc || '/road.jpg'}
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
                          border: `2px ${
                            markerId === editingMarkerId ? 'dashed' : 'solid'
                          } rgb(${marker.color.r}, ${marker.color.g}, ${
                            marker.color.b
                          })`,
                          backgroundColor: `rgba(${marker.color.r}, ${marker.color.g}, ${marker.color.b}, 0.1)`,
                          zIndex: markerId === editingMarkerId ? 100 : 'auto',
                        }}
                      >
                        {markerId === editingMarkerId ? (
                          <input
                            className='bg-transparent text-sm border-none text-white w-full text-center outline-none px-1 py-0.5 opacity-100'
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
                            className='text-sm flex flex-row items-center justify-between font-medium px-1 pt-1 break-words'
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
                            <span>{marker.name}</span>
                            <button
                              className='text-white text-sm font-semibold'
                              onClick={() => handleDeleteMarker(markerId)}
                            >
                              <BiTrash />
                            </button>
                          </div>
                        ) : (
                          <p className='text-center text-xs text-white'>
                            Click to edit
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className='flex items-center justify-center gap-2'>
                <button
                  disabled={isDrawing || editingMarkerId !== ''}
                  onClick={startMarking}
                  className='bg-indigo-800 hover:bg-indigo-700 text-white py-2 px-4 rounded-sm disabled:bg-indigo-500 disabled:cursor-not-allowed flex flex-row items-center justify-center'
                >
                  <BiCrop className='text-white w-4 h-4' />
                  <span className='ml-2'>Add a mark ( Press R)</span>
                </button>

                <button
                  className='bg-indigo-800 hover:bg-indigo-700 text-white py-2 px-4 rounded-sm disabled:bg-indigo-500 disabled:cursor-not-allowed flex flex-row items-center justify-center'
                  onClick={() => {
                    const fileInput = document.createElement('input');
                    fileInput.setAttribute('type', 'file');
                    fileInput.setAttribute('accept', '.json');
                    fileInput.addEventListener(
                      'change',
                      (evt: React.ChangeEvent<HTMLInputElement>) => {
                        const file = evt.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const result = event.target?.result as string;
                            const markers = JSON.parse(result);
                            setMarkers(markers);
                          };
                          reader.readAsText(file);
                        }
                      }
                    );
                    fileInput.click();
                  }}
                >
                  <BiUpload className='text-white w-4 h-4' />
                  <span className='ml-2'>Upload Markers JSON</span>
                </button>
              </div>
            </div>
            <div className='sm:col-span-2 bg-slate-100 p-4'>
              <div className='flex flex-col'>
                <div className='flex flex-row items-center justify-between'>
                  <h2 className='text-xl font-semibold text-slate-950'>
                    Markers
                  </h2>
                  <div className='flex flex-row items-center gap-2'>
                    <button
                      disabled={Object.keys(markers).length === 0}
                      className='bg-indigo-800 hover:bg-indigo-700 text-white py-2 px-4 rounded-sm disabled:bg-indigo-500 disabled:cursor-not-allowed flex flex-row items-center justify-center'
                      onClick={() => {
                        setMarkers({});
                      }}
                    >
                      <BiTrash className='text-white w-4 h-4' />
                      <span className='ml-2'>Clear all</span>
                    </button>

                    <button
                      disabled={Object.keys(markers).length === 0}
                      className='bg-indigo-800 hover:bg-indigo-700 text-white py-2 px-4 rounded-sm disabled:bg-indigo-500 disabled:cursor-not-allowed flex flex-row items-center justify-center'
                      onClick={() => {
                        const dataStr =
                          'data:text/json;charset=utf-8,' +
                          encodeURIComponent(JSON.stringify(markers));
                        const downloadAnchorNode = document.createElement('a');
                        downloadAnchorNode.setAttribute('href', dataStr);
                        downloadAnchorNode.setAttribute(
                          'download',
                          'markers.json'
                        );
                        document.body.appendChild(downloadAnchorNode);
                        downloadAnchorNode.click();
                        downloadAnchorNode.remove();
                      }}
                    >
                      <BiDownload className='text-white w-4 h-4' />
                      <span className='ml-2'>Export</span>
                    </button>
                  </div>
                </div>

                <div className='border-t border-slate-400 mt-2' />

                <div className='my-4 flex flex-col justify-center space-y-3'>
                  {Object.keys(markers).map((markerId) => {
                    const marker = markers[markerId];
                    return (
                      <div
                        key={`text-${markerId}`}
                        className='flex flex-row items-center gap-2 justify-between'
                      >
                        <div className='flex flex-row items-center'>
                          <div
                            className='w-6 h-6 rounded mr-2'
                            style={{
                              backgroundColor: `rgb(${marker.color.r}, ${marker.color.g}, ${marker.color.b})`,
                            }}
                          ></div>
                          <span className='text-base font-medium'>
                            {marker.name}
                          </span>
                        </div>
                        <div className='flex flex-row items-center gap-2'>
                          <button
                            className='text-white text-sm font-semibold'
                            onClick={() => {
                              setEditingMarkerId(markerId);
                            }}
                          >
                            <BiEdit className='text-gray-800 h-4 w-4' />
                          </button>
                          <button
                            className='text-white text-sm font-semibold'
                            onClick={() => handleDeleteMarker(markerId)}
                          >
                            <BiTrash className='text-gray-800 h-4 w-4' />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {Object.keys(markers).length === 0 && (
                    <p className='text-center text-sm text-gray-800'>
                      No markers added
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center pt-10'>
            <h1 className='text-4xl font-semibold text-slate-950'>
              Marker App by{' '}
              <a href='https://twitter.com/sandeep_indie'>Sandeep</a>
            </h1>
            <p className='text-lg font-medium text-slate-850 my-2'>
              Upload an image to start
            </p>
            <div className='mt-8'>
              <div className='flex flex-row items-center justify-center gap-2'>
                <button
                  className='bg-indigo-800 hover:bg-indigo-700 text-white py-2 px-4 rounded-sm flex flex-row items-center justify-center'
                  onClick={uploadImage}
                >
                  <BiUpload className='inline-block mr-2' />
                  Upload An Image
                </button>

                <button
                  className='bg-indigo-800 hover:bg-indigo-700 text-white py-2 px-4 rounded-sm flex flex-row items-center justify-center'
                  onClick={() => {
                    setImageSrc('/road.jpg');
                  }}
                >
                  Continue with sample image
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default App;
