import React from 'react';
import InfoPage from './InfoPage';

const SafeguardingPolicy: React.FC = () => (
  <InfoPage title="Safeguarding and Child Safety" emoji="🛡️" lastUpdated="August 10, 2026">
    <div className="prose max-w-none">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Keeping children safe on DemiWura</h2>
      <p className="text-gray-700 mb-4">
        DemiWura is designed mainly for children aged 7–11. We put the child's best interests, privacy and wellbeing
        first when designing accounts, learning content, AI assistance, classes and competitive activities. This policy
        explains our current safeguards and how to report a concern; it does not replace a school or organisation's own
        statutory safeguarding procedures.
      </p>

      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">1. Our current safeguards</h3>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
        <li><strong>Parent-managed child access:</strong> a parent creates each child profile and private PIN. Children do not need an email address.</li>
        <li><strong>Limited social exposure:</strong> there is no public chat, direct messaging or public profile. A limited display name or alias may be visible to authorised participants in a class, quiz battle or leaderboard.</li>
        <li><strong>No advertising:</strong> DemiWura does not display adverts or use child data for advertising profiles.</li>
        <li><strong>No geolocation:</strong> child profiles do not request location, school, address, photograph or contact details.</li>
        <li><strong>Role-based access:</strong> parent, teacher and administrator tools require the appropriate authenticated role.</li>
        <li><strong>Security controls:</strong> PIN hashing, request validation, rate limits, Turnstile checks and restricted codes help reduce unauthorised access and abuse.</li>
        <li><strong>Educational personalisation:</strong> progress and quiz results can adjust difficulty and recommend practice. This is not used for advertising or a legally significant decision.</li>
      </ul>

      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">2. Classes, battles and leaderboards</h3>
      <p className="text-gray-700 mb-3">
        These features allow limited real-time or shared participation, so the following rules apply:
      </p>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
        <li>Class and battle codes must be shared only with the intended group and reset if disclosed.</li>
        <li>Children must not use a display name to reveal a surname, school, contact information or other private detail.</li>
        <li>Parents and teachers should supervise live activities and stop a session if unexpected participants or content appear.</li>
        <li>Suspected bullying, impersonation, code misuse or unauthorised access should be reported immediately.</li>
      </ul>

      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">3. Learning and AI content</h3>
      <p className="text-gray-700 mb-3">
        DemiWura combines reviewed content, question-bank content and AI-assisted material. Generated material is subject
        to automated validation and provider safety controls where supported, but it is not manually reviewed every time
        before display and no automated system is perfect.
      </p>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
        <li>Children should not enter private information into MiRa.</li>
        <li>Teachers should preview important AI-assisted material before using it in a lesson.</li>
        <li>A child should stop and tell a trusted adult if a response is frightening, sexual, hateful, asks for secrecy or personal details, or appears seriously wrong.</li>
        <li>Reported content is assessed for removal, correction, guardrail changes and any necessary escalation.</li>
      </ul>

      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">4. Reporting a concern</h3>
      <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-5">
        <p className="font-bold text-red-950">If a child is in immediate danger, call 999.</p>
        <p className="text-red-900 mt-2">
          For a concern involving DemiWura, email{' '}
          <a href="mailto:safeguarding@demiwuraks2.co.uk" className="font-semibold underline">
            safeguarding@demiwuraks2.co.uk
          </a>{' '}
          or use the Contact page and choose a safeguarding subject. Do not send unnecessary sensitive details.
        </p>
      </div>
      <p className="text-gray-700 mb-3">Other sources of help:</p>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
        <li><a href="https://www.ceop.police.uk/Safety-Centre/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">CEOP Safety Centre</a> — report online sexual abuse or grooming concerns</li>
        <li><a href="https://www.childline.org.uk/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Childline</a> — confidential help for children on 0800 1111</li>
        <li><a href="https://www.nspcc.org.uk/keeping-children-safe/reporting-abuse/nspcc-helpline/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">NSPCC Helpline</a> — advice for adults worried about a child</li>
      </ul>

      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">5. What happens after a report</h3>
      <ol className="list-decimal pl-6 text-gray-700 space-y-2 mb-4">
        <li>The BTLTECH safeguarding contact reviews the available information and assesses immediate risk.</li>
        <li>We may preserve relevant records, restrict an account, class or feature, and ask the reporting adult for limited clarification.</li>
        <li>We correct or remove platform content and strengthen technical controls where appropriate.</li>
        <li>Where there is a risk of harm or a legal duty, information may be referred to the school, police, local authority, CEOP or another appropriate safeguarding body.</li>
        <li>Information is shared only to the extent reasonably necessary for safety, investigation or legal compliance.</li>
      </ol>

      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">6. Parents, teachers and schools</h3>
      <p className="text-gray-700 mb-4">
        Adults should use age-appropriate supervision, keep codes private, review dashboard activity and maintain clear
        routes for children to ask for help. Schools remain responsible for their designated safeguarding lead, staff
        vetting, acceptable-use rules, parental communications and referrals under their own policies.
      </p>

      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">7. Risk review</h3>
      <p className="text-gray-700 mb-4">
        We review child privacy, content, contact and user-to-user risks when relevant features change and at least annually.
        We assess the application of the ICO Children's Code and Online Safety Act duties to the service, document material
        risks and prioritise controls that protect children rather than relying on policy wording alone.
      </p>
    </div>
  </InfoPage>
);

export default SafeguardingPolicy;
