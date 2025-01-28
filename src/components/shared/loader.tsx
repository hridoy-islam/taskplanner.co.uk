const Loader = () => {
  return (
    <div className="mt-60 flex flex-row items-center justify-center gap-2">
      <h2>Loading</h2>
      <div className="h-5 w-5 animate-spin rounded-full border-4 border-dashed border-black"></div>
    </div>
  );
};

export default Loader;
