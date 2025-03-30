const normalize = (data, fields) => {
  const normalizedData = { ...data };

  fields.forEach((f) => delete normalizedData[f]);

  return normalizedData;
};

export default normalize;
