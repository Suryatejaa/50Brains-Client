// components/tabs/PortfolioTab.tsx
import React from 'react';
import { UserProfileData } from '../../types/profile.types';

interface PortfolioTabProps {
  user: UserProfileData;
  // workHistory?: WorkHistoryData | null;
  isOwner: boolean;
}

const PortfolioTab: React.FC<PortfolioTabProps> = ({
  user,
  // workHistory,
  isOwner,
}) => {
  return (
    <div className="portfolio-tab">
      <div className="portfolio-header">
        <h3>Portfolio</h3>
        {isOwner && (
          <button className="btn btn--primary">Manage Portfolio</button>
        )}
      </div>

      {/* Portfolio URL */}
      {user.portfolioUrl && (
        <div className="portfolio-link">
          <h4>Portfolio Website</h4>
          <a
            href={user.portfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="portfolio-url"
          >
            {user.portfolioUrl}
          </a>
        </div>
      )}

      {/* Skills showcase */}
      {/* {workHistory?.skills && workHistory.skills.length > 0 && (
        <div className="skills-showcase">
          <h4>Skills & Expertise</h4>
          <div className="skills-grid">
            {workHistory.skills.map((skill: any, index: number) => (
              <div key={index} className="skill-card">
                <div className="skill-card__header">
                  <h5>{skill.skill}</h5>
                  <span className="skill-level">{skill.level}</span>
                </div>
                <div className="skill-card__stats">
                  <div className="skill-stat">
                    <span className="stat-label">Experience</span>
                    <span className="stat-value">
                      {skill.projectCount} projects
                    </span>
                  </div>
                  <div className="skill-stat">
                    <span className="stat-label">Rating</span>
                    <span className="stat-value">
                      ⭐ {skill.averageRating?.toFixed(1) || 'N/A'}
                    </span>
                  </div>
                  <div className="skill-score">
                    <div className="score-bar">
                      <div
                        className="score-fill"
                        style={{ width: `${skill.score}%` }}
                      ></div>
                    </div>
                    <span className="score-text">{skill.score}/100</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )} */}

      {/* Recent work showcase */}
      {/* {workHistory?.recentWork && workHistory.recentWork.length > 0 && (
        <div className="recent-work-showcase">
          <h4>Recent Work</h4>
          <div className="work-grid">
            {workHistory.recentWork.map((work: any, index: number) => (
              <div key={index} className="work-card">
                <div className="work-card__header">
                  <h5>{work.title}</h5>
                  <span className="work-category">{work.category}</span>
                </div>
                <div className="work-card__meta">
                  <span className="work-rating">⭐ {work.clientRating}</span>
                  <span className="work-date">
                    {new Date(work.completedAt).toLocaleDateString()}
                  </span>
                  {work.verified && (
                    <span className="work-verified">✓ Verified</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )} */}

      {/* Achievements */}
      {/* {workHistory?.achievements && workHistory.achievements.length > 0 && (
        <div className="achievements-showcase">
          <h4>Achievements</h4>
          <div className="achievements-list">
            {workHistory.achievements.map((achievement: any, index: number) => (
              <div key={index} className="achievement-card">
                <div className="achievement-icon">🏆</div>
                <div className="achievement-content">
                  <h5>{achievement.title}</h5>
                  <p>{achievement.description}</p>
                  <div className="achievement-meta">
                    <span className="achievement-type">{achievement.type}</span>
                    <span className="achievement-date">
                      {new Date(achievement.achievedAt).toLocaleDateString()}
                    </span>
                    {achievement.verified && (
                      <span className="achievement-verified">✓ Verified</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )} */}

      {/* Role-specific portfolio content */}
      {user.roles.includes('CREW') && user.equipmentOwned.length > 0 && (
        <div className="equipment-showcase">
          <h4>Equipment & Tools</h4>
          <div className="equipment-grid">
            {user.equipmentOwned.map((equipment: string, index: number) => (
              <div key={index} className="equipment-item">
                <span className="equipment-name">{equipment}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {/* {(!workHistory ||
        (!workHistory.skills?.length && !workHistory.recentWork?.length)) &&
        !user.portfolioUrl && (
          <div className="portfolio-empty">
            <div className="empty-state">
              <h4>No Portfolio Content Yet</h4>
              <p>
                {isOwner
                  ? 'Start building your portfolio by completing projects and showcasing your skills.'
                  : "This user hasn't added any portfolio content yet."}
              </p>
              {isOwner && (
                <button className="btn btn--primary">Get Started</button>
              )}
            </div>
          </div>
        )} */}
    </div>
  );
};

export default PortfolioTab;
