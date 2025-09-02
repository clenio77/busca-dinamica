import React, { useState, useEffect } from 'react';

function TestSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/ceps.json')
      .then(response => response.json())
      .then(data => {
        console.log('Dados carregados:', data.length);
        setAllData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Erro:', error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (searchTerm.length < 2) {
      setResults([]);
      return;
    }

    const filtered = allData.filter(item => {
      const logradouro = (item.logradouro || '').toLowerCase();
      const bairro = (item.bairro || '').toLowerCase();
      const cidade = (item.cidade || '').toLowerCase();
      const cep = (item.cep || '').toLowerCase();
      const term = searchTerm.toLowerCase();

      return logradouro.includes(term) ||
             bairro.includes(term) ||
             cidade.includes(term) ||
             cep.includes(term);
    }).slice(0, 20);

    setResults(filtered);
  }, [searchTerm, allData]);

  if (loading) return <div>Carregando...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Teste de Busca</h1>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Digite para buscar..."
        style={{ width: '300px', padding: '10px', fontSize: '16px' }}
      />
      <p>Total de registros: {allData.length}</p>
      <p>Resultados encontrados: {results.length}</p>
      
      <div>
        {results.map((item, index) => (
          <div key={index} style={{ 
            border: '1px solid #ccc', 
            margin: '5px 0', 
            padding: '10px',
            backgroundColor: '#f9f9f9'
          }}>
            <strong>Logradouro:</strong> {item.logradouro || '(vazio)'}<br/>
            <strong>CEP:</strong> {item.cep}<br/>
            <strong>Bairro:</strong> {item.bairro || '(vazio)'}<br/>
            <strong>Cidade:</strong> {item.cidade}<br/>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TestSearch;
