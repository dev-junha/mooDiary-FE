const Frame = () => {
  return (
    <div className="w-[146px] pt-12 sm:pt-16 flex">
      <div>
        <img src="/llframe.png" className="max-w-[81px] h-[1980px]" alt="최좌측 프레임" />
      </div>
      <div className="w-[65px] flex justify-center pt-32 bg-[rgba(231,210,191,0.65)]">
        <img src="/lframe.png" className="max-w-[18px] h-[1828px]" alt="좌측 프레임" />
      </div>
    </div>
  );
};

export default Frame;