import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Injectable } from '@angular/core';


@Injectable()
export class RanksService {

  constructor() { }

  currentRank = 0
  currentRank$ : BehaviorSubject<number> = new BehaviorSubject(this.currentRank)


  ranks = [
    {
      name: 'APPLICANT',
      details: 'Applicants may join the guild once they have obtained at least 250 professional points, '+
      'and received a recommendation from a guild member. '+
      'Submiting an application is the first step in the journey of becoming a master! ' +
      'The more points you score, the higher rank you can achieve. ' +
      'In order to join the guild, you need to get a recommendation from a guild member',
      score: '0-250',
      step: 50,
      base: 0,
      habitants: 0
    },
    {
      name: 'APPRENTICE',
      details: 'Before a new employee could rise to the level of mastery, '+
      'he had to go through a schooling period during which he was first called an apprentice. '+
      'After this period he could rise to the level of craftsman. '+
      'Apprentices would typically not learn more than the most basic techniques '+
      "until they were trusted by their peers to keep the guild's or company's secrets.",
      score: '251-750',
      step: 100,
      base: 250,
      habitants: 0
    },
    {
      name: 'CRAFTSMAN',
      details: 'After being employed by a master for several years, and after producing a qualifying piece of work,  '+
      'the apprentice was granted the rank of craftsman and was given documents ' +
      '(letters or certificates from his master and/or the guild itself). ' +
      'Although a craftsman has completed a trade certificate and is able to work as an employee, ' +
      'he is not yet able to work as a self-employed master.',
      score: '751-1500',
      step: 150,
      base: 750,
      habitants: 0
    },
    {
      name: 'JOURNEYMAN',
      details: 'A journeyman is a skilled worker who has successfully completed an official apprenticeship qualification in a building trade or craft. '+
      'He is considered competent and authorized to work in that field as a fully qualified employee. ' +
      'A journeyman earns his license by education, supervised experience, and examination, ' +
      'which certified him as a journeyman and entitled him to travel to other towns and countries to learn the art from other masters. '+
      'These journeys could span large parts of Europe and were an unofficial way of communicating new methods and techniques. ' +
      'In order to become a Master, a Journeyman would have to go on a three-year voyage called Journeyman years.',
      score: '1501-3000',
      step: 300,
      base: 1500,
      habitants: 0
    },
    {
      name: 'MASTER',
      details: 'An aspiring master would have to pass through the career chain from apprentice to journeyman '+
      'before he could be elected to become a master. '+
      'He would then have to produce a masterpiece. '+
      'If the masterpiece was not accepted by the masters, he would never become a master, possibly remaining a journeyman for the rest of his life.',
      score: '3001-5000',
      step: 400,
      base: 3000,
      habitants: 0
    },
    {
      name: 'GRANDMASTER',
      details: 'The few who got the title of grandmasters were world renowned masters, widely esteemed by their fellow masters. '+
      'The title brought with it respect and financial wealth.',
      score: '5001-10000',
      step: 1000,
      base: 5000,
      habitants: 0
    },
    {
      name: 'GUILDHALL',
      details: '',
      score: '',
      step: 0,
      base: 0,
      habitants: 0
    },

  ];

  getCurrRank$()
  {
    return this.currentRank$.asObservable();
  }

  setCurrRankIndex(rankIndex : number)
  {
    this.currentRank = rankIndex
    this.currentRank$.next(this.currentRank)
  }
  setCurrRank(rank : string)
  {
    this.setCurrRankIndex(this.ranks.findIndex((x) => x.name == rank))
  }

  getRanks()
  {
    return this.ranks;
  }

  getRankIndex(rank : string)
  {
    return this.ranks.findIndex((x)=> x.name == rank)
  }




}
