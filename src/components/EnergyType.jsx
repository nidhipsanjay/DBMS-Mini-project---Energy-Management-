import CrudTemplate from './CrudTemplate';
export default function EnergyTypes() {
  return <CrudTemplate title="Energy Types" apiEndpoint="http://localhost:5000/api/energytypes" columns={['energyTypeID', 'typeName', 'description']} />;
}
