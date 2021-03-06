var express = require('express');
    User = require('../models/User');
    Survey = require('../models/Survey');
    Quest = require('../models/Quest');
var router = express.Router();

function needAuth(req, res, next) {
    if (req.session.user) {
      next();
    } else {
      req.flash('danger', '로그인이 필요합니다.');
      res.redirect('/signin');
    }
}

// survey page - 설문지 페이지
router.get('/', needAuth, function(req, res, next) {
  Survey.find({}, function(err, surveys) {
    if (err) {
      return next(err);
    }
    res.render('surveys/index', {surveys:surveys});
  });
});

// new page - 설문지 생성 페이지
router.get('/new', needAuth, function(req, res, next) {
  res.render('surveys/new',{survey: {}});
});

router.post('/', function(req, res, next) {
  var survey = new Survey({
    title: req.body.title,
    content: req.body.content
  });
  survey.save(function(err){
    if(err) {
      return next(err);
    }
  });
  res.redirect('/surveys/list');
});

router.get('/list', needAuth, function(req, res, next) {
  Survey.find({}, function(err, surveys) {
    if (err) {
      return next(err);
    }
    res.render('surveys/list', {surveys:surveys});
  });
});
// title 누르고 내용 확인
router.get('/:id', needAuth, function(req, res, next) {
  Survey.findById({_id: req.params.id}, function(err, survey) {
    if (err) {
      return next(err);
    }
    Quest.find({survey: survey.id}, function(err, quests) {
      if (err) {
        return next(err);
      }
      res.render('surveys/show', {survey: survey, quests: quests});
    });
  });
});

router.post('/:id/quests', function(req, res, next) {
  var quest = new Quest({
    survey: req.params.id,
    category: req.body.category,
    question: req.body.question,
    answer: req.body.answer
  });

  quest.save(function(err) {
    if (err) {
      return next(err);
    }
    Survey.findByIdAndUpdate(req.params.id, function(err) {
      if (err) {
        return next(err);
      }
      res.redirect('/surveys/' + req.params.id);
    });
  });
});

// 설문지 수정
router.get('/:id/edit', needAuth, function(req, res, next) {
  Survey.findById(req.params.id, function(err, survey) {
    if (err) {
      return next(err);
    }
    res.render('surveys/edit', {survey: survey});
  });
});

router.put('/:id', function(req, res, next) {
  Survey.findById({_id: req.params.id}, function(err, survey) {
    if (err) {
      return next(err);
    }
    // 입력 받는 값 수정
    survey.title = req.body.title;
    survey.content = req.body.content;
    // 변경 사항 저장
    survey.save(function(err) {
      if (err) {
        return next(err);
      }else{
        res.redirect('/surveys');
      }
    });
  });
});

// 설문 삭제
router.delete('/:id', needAuth, function(req, res, next) {
  Survey.findOneAndRemove({_id: req.params.id}, function(err) {
    if (err) {
      return next(err);
    }
    res.redirect('/surveys/list');
  });
});

module.exports = router;
