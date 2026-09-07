const timeline = [
  { period: 'Depuis 2023', title: 'Développeur iOS indépendant', school: 'Auto-entrepreneur', description: 'Création d’applications iOS et réalisation de sites web selon les projets.' },
  { period: '2021 — 2022', title: 'Développement iOS', school: 'OpenClassrooms', description: 'Formation diplômante de niveau bac +3, reconnue par l’État.' },
  { period: '2021', title: 'Bachelor', school: 'École IRIS', description: 'Développeur de solutions digitales.' },
  { period: '2018 — 2020', title: 'BTS SIO', school: 'École IRIS', description: 'Services informatiques aux organisations.' },
]

export default function Roadmap() {
  return (
    <section className="about-career site-container" aria-labelledby="career-title">
      <div className="section-heading"><div><p className="eyebrow">Le parcours du créateur</p><h2 id="career-title">Du code aux<br />applications.</h2></div><p>Une formation en informatique et en développement iOS, puis l’envie de créer des produits indépendants.</p></div>
      <ol className="career-list">{timeline.map(item => <li key={item.period}><p className="career-date">{item.period}</p><div><h3>{item.title}</h3><p className="career-school">{item.school}</p></div><p className="career-description">{item.description}</p></li>)}</ol>
    </section>
  )
}
