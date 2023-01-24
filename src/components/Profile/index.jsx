import React, { useContext, useState } from 'react';
import { UserContext } from '../../utils/context/api-http';
import styled from 'styled-components';
// Composants enfants
import Loader from '../Loader';
import Error from '../Error';
import Hello from '../Hello';
import Activity from '../Activity';
import Sessions from '../Sessions';
import Performance from '../Performance';
import Score from '../Score';
import KeyData from '../KeyData';
// Méthodes pour fabriquer des objets typés à afficher dans les composants
import userFactory from '../../factories/userFactory';
import performanceFactory from '../../factories/performanceFactory';
import sessionFactory from '../../factories/sessionFactory';
import activityFactory from '../../factories/activityFactory';
/** @typedef {import('../../utils/context/typedef').UserContext} Context Raccourci pour importer des types des propriétés JSON */

/** @type {Object} Cette balise `<div>` est la 2eme grille imbriquée,  son parent est la balise `<main>` qui  luis sert de balise anonyme pour être contnenue dans la 1ere grille qui est #root */
const Grid = styled.div``;

/** @type {Object} Cette balise `<div>` contient les données clés Calories, protéines, glucides, lipides dans la dernière colonne de la grille et s'étend sur 4 lignes */
const DataKeys = styled.div`
  border: 1px black green;
`;

/**
 * @description Un composant pour fabrique et afficher un profil utlisateur et les graphiques de ses activités sportives
 * Ce composant se connect au contexte de données
 * @returns {React.ReactElement} Profile
 */
function Profile() {
  /**  @typedef {number} seconds Nombre de seconde(s) à attendre */
  const [
    /** @type {seconds} */
    seconds,
    setSeconds,
  ] = useState(0); // 1s

  /** @type {Context} */
  const {
    codeStatus,
    data,
    dataActivity,
    dataSessions,
    dataPerformance,
    isLoading,
    error,
    errorMessage,
  } = useContext(UserContext);

  /** @type {Object} Un utilisateur à fabriquer */
  let user;
  // Fabriquer l'utilisateur typé quand le chargement est fini, sans erreur et à la fin du timer
  if (!isLoading && !error && seconds === 0) {
    // Protection
    if (Object.keys(data).length > 0) {
      /** @type {userFactory} Factory Method pour fabriquer l'utilisateur à partir de données JSON */
      const userModel = userFactory(data);
      // Fabriquer l'utilisateur
      user = userModel.getUser();

      /** @type {performanceFactory} Factory Method pour fabriquer les performances de l'utilisateur à partir de données JSON */
      const performanceModel = performanceFactory(dataPerformance);
      // Fabriquer les performances pour l'utilisateur
      user.performances = performanceModel.getPerformances();

      /** @type {sessionFactory} Factory Method pour fabriquer les sessions de l'utilisateur à partir de données JSON */
      const sessionModel = sessionFactory(dataSessions);
      user.sessions = sessionModel.getSessions();

      /** @type {activityFactory} Factory Method pour fabriquer les jours d'activités de l'utlisateur à partir de données JSON*/
      const activityModel = activityFactory(dataActivity);
      user.activities = activityModel.getActivities();

      console.log(user);
    }
  }

  return isLoading || seconds > 0 ? (
    <Loader seconds={seconds} setSeconds={setSeconds} />
  ) : error ? (
    <Error
      codeStatus={codeStatus}
      isLoading={isLoading}
      error={error}
      errorMessage={errorMessage}
    />
  ) : (
    <Grid className="dashboard__profile">
      <Hello firstname={user?.firstName} />
      {/** les graphiques  */}
      <Score todayScore={user?.todayScore} />
      <Activity activities={user.activities} />
      <Sessions sessions={user.sessions} />
      <Performance performances={user.performances} />
      {/** les Cards des données clefs  */}
      <DataKeys className="dashboard__profile__datakeys">
        {user.keysData.map(({ keyName, designation, data, unit }, index) => (
          <KeyData
            key={`${keyName}-${1000 + index}`}
            id={keyName}
            designation={designation}
            data={data}
            unit={unit}
          />
        ))}
      </DataKeys>
    </Grid>
  );
}

export default Profile;
