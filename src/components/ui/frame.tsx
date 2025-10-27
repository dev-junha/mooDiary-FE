const frame = () => {
    return (
        <div className="max-w-[130px] max-h-[1980px] container px-4 sm:px-6 pt-12 sm:pt-16 flex">
            <div>
                <img src="/llframe.png" className="max-w-[80px] h-full" alt="최좌측 프레임" />
            </div>
            <div className="w-[50px] h-[1700px] flex justify-center items-center">
                <img src="/lframe.png" className="max-w-[18px] h-full pt-[40px]" alt="좌측 프레임" />
            </div>
        </div>
    );
};

export default frame;