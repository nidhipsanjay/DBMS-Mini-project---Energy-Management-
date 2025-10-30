import CrudTemplate from './CrudTemplate';

export default function Plants() {
  return (
    <CrudTemplate
  title="Power Plants"
  apiEndpoint="http://localhost:5000/api/plants"
  columns={["plantID", "name", "location", "capacity", "energyTypeID", "regionID"]}
  idField="plantID"
/>

  );
}
