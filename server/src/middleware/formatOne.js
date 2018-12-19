const formatRecord = (record) => {
  const formatted = {
    id: record.id,
    createdOn: record.created_on,
    createdBy: record.created_by,
    type: record.type,
    location: record.location,
    status: record.status,
    Images: record.images,
    Videos: record.videos,
    comment: record.comment,

  };
  return formatted;
};
export default formatRecord;
