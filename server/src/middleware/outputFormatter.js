const formatMedia = (media) => {
  if (media.length > 0) {
    const mediaArr = media.split(',');
    const formattedMediaArr = [];
    for (let i = 0; i < mediaArr.length; i += 1) {
      formattedMediaArr.push(`http://localhost:${process.env.PORT}/${mediaArr[i].trim()}`);
    }
    return formattedMediaArr;
  }
  return [];
};

const formatOutput = (records) => {
  const formattedOutput = records.map((record) => {
    const img = formatMedia(record.images);
    const vid = formatMedia(record.videos);
    const formatted = {
      id: record.id,
      createdOn: record.created_on,
      createdBy: record.created_by,
      type: record.type,
      location: record.location,
      status: record.status,
      Images: img,
      Videos: vid,
      comment: record.comment,
    };
    return formatted;
  });

  return formattedOutput;
};

export default formatOutput;
