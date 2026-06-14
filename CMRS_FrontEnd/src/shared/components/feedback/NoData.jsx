function NoData({ message = 'لا توجد عناصر للعرض حالياً.' }) {
  return <p className="no-data-message">{message}</p>;
}

export default NoData;