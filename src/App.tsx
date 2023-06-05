function App() {
  return (
    <>
      <header className='max-w-full mx-auto'>
        <nav className='flex items-center justify-between flex-wrap bg-indigo-700 px-8 py-4'>
          <div className='flex items-center flex-shrink-0 text-white mr-6'>
            <span className='font-semibold text-xl tracking-tight'>
              MarkerX
            </span>
          </div>
        </nav>
      </header>
      <main className='max-w-8xl mx-auto'>
        <div className='grid w-full sm:grid-cols-6 min-h-screen'>
          <div className='sm:col-span-4 bg-white p-4'></div>
          <div className='sm:col-span-2 bg-slate-100 p-4'></div>
        </div>
      </main>
    </>
  );
}

export default App;
